const express = require("express");
const cors = require("cors");
const path = require("path");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
require("dotenv").config();

const db = require("./db");
const { SESClient, SendEmailCommand } = require("@aws-sdk/client-ses");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "../frontend/dist")));

const ses = new SESClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      tenant_id: user.tenant_id,
      email: user.email,
      role: user.role,
      full_name: user.full_name,
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
}

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.currentUser = decoded;
    req.currentTenantId = decoded.tenant_id;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

function adminOnly(req, res, next) {
  if (!req.currentUser || req.currentUser.role !== "admin") {
    return res.status(403).json({ error: "Admin access only" });
  }
  next();
}

async function sendSetupPasswordEmail(toEmail, fullName, setupToken) {
  const setupLink = `${process.env.APP_BASE_URL}/setup-password?token=${setupToken}`;

  const command = new SendEmailCommand({
    Source: process.env.SENDER_EMAIL,
    Destination: {
      ToAddresses: [toEmail],
    },
    Message: {
      Subject: {
        Data: "Set up your account password",
      },
      Body: {
        Text: {
          Data:
            `Hello ${fullName},\n\n` +
            `An account has been created for you.\n` +
            `Please set your password using the link below:\n\n` +
            `${setupLink}\n\n` +
            `This link will expire in 24 hours.\n`,
        },
      },
    },
  });

  await ses.send(command);
}

// ---------- AUTH ----------

// Register tenant admin
app.post("/auth/register", async (req, res) => {
  try {
    const { tenant_name, full_name, email, password } = req.body;

    if (!tenant_name || !full_name || !email || !password) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    db.query("SELECT id FROM users WHERE email = ?", [email], async (checkErr, checkResult) => {
      if (checkErr) {
        return res.status(500).json({ error: checkErr.message });
      }

      if (checkResult.length > 0) {
        return res.status(400).json({ error: "Email already exists" });
      }

      db.query(
        "INSERT INTO tenants (tenant_name) VALUES (?)",
        [tenant_name],
        async (tenantErr, tenantResult) => {
          if (tenantErr) {
            return res.status(500).json({ error: tenantErr.message });
          }

          const tenantId = tenantResult.insertId;
          const passwordHash = await bcrypt.hash(password, 10);

          db.query(
            `
            INSERT INTO users
              (tenant_id, full_name, email, password_hash, role, is_password_set, is_active)
            VALUES (?, ?, ?, ?, 'admin', TRUE, TRUE)
            `,
            [tenantId, full_name, email, passwordHash],
            (userErr, userResult) => {
              if (userErr) {
                return res.status(500).json({ error: userErr.message });
              }

              const user = {
                id: userResult.insertId,
                tenant_id: tenantId,
                full_name,
                email,
                role: "admin",
              };

              const token = generateToken(user);

              return res.json({
                message: "Register successful",
                token,
                user,
              });
            }
          );
        }
      );
    });
  } catch (err) {
    console.error("Register error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

// Login
app.post("/auth/login", (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    db.query(
      `
      SELECT id, tenant_id, full_name, email, password_hash, role, is_password_set, is_active
      FROM users
      WHERE email = ?
      LIMIT 1
      `,
      [email],
      async (err, result) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }

        if (result.length === 0) {
          return res.status(401).json({ error: "Invalid credentials" });
        }

        const user = result[0];

        if (!user.is_active) {
          return res.status(403).json({ error: "User account is inactive" });
        }

        if (!user.is_password_set || !user.password_hash) {
          return res.status(403).json({ error: "Password has not been set yet" });
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (!isMatch) {
          return res.status(401).json({ error: "Invalid credentials" });
        }

        const token = generateToken(user);

        return res.json({
          message: "Login successful",
          token,
          user: {
            id: user.id,
            tenant_id: user.tenant_id,
            full_name: user.full_name,
            email: user.email,
            role: user.role,
          },
        });
      }
    );
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

// Validate setup token
app.get("/auth/setup-password/:token", (req, res) => {
  const { token } = req.params;

  const sql = `
    SELECT id, email, full_name
    FROM users
    WHERE setup_token = ?
      AND setup_token_expires_at > NOW()
      AND is_active = TRUE
    LIMIT 1
  `;

  db.query(sql, [token], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (result.length === 0) {
      return res.status(400).json({ error: "Invalid or expired setup token" });
    }

    return res.json({
      message: "Token is valid",
      user: result[0],
    });
  });
});

// Set password
app.post("/auth/setup-password", async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ error: "Token and password are required" });
    }

    const sql = `
      SELECT id
      FROM users
      WHERE setup_token = ?
        AND setup_token_expires_at > NOW()
        AND is_active = TRUE
      LIMIT 1
    `;

    db.query(sql, [token], async (err, result) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (result.length === 0) {
        return res.status(400).json({ error: "Invalid or expired setup token" });
      }

      const userId = result[0].id;
      const passwordHash = await bcrypt.hash(password, 10);

      db.query(
        `
        UPDATE users
        SET password_hash = ?,
            is_password_set = TRUE,
            setup_token = NULL,
            setup_token_expires_at = NULL
        WHERE id = ?
        `,
        [passwordHash, userId],
        (updateErr) => {
          if (updateErr) {
            return res.status(500).json({ error: updateErr.message });
          }

          return res.json({ message: "Password has been set successfully" });
        }
      );
    });
  } catch (err) {
    console.error("Set password error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

// ---------- CURRENT USER ----------
app.get("/me", authMiddleware, (req, res) => {
  res.json({
    currentTenantId: req.currentTenantId,
    currentUser: req.currentUser,
  });
});

// ---------- USERS ----------
app.get("/users", authMiddleware, (req, res) => {
  const tenantId = req.currentTenantId;

  const sql = `
    SELECT id, tenant_id, full_name, email, role, is_password_set, is_active, created_at
    FROM users
    WHERE tenant_id = ?
    ORDER BY id DESC
  `;

  db.query(sql, [tenantId], (err, result) => {
    if (err) {
      console.error("Get users error:", err);
      return res.status(500).json({ error: err.message });
    }
    res.json(result);
  });
});

// Admin creates user without password; user sets password via email link
app.post("/users", authMiddleware, adminOnly, async (req, res) => {
  try {
    const tenantId = req.currentTenantId;
    const { full_name, email, role } = req.body;

    if (!full_name || !email) {
      return res.status(400).json({ error: "Full name and email are required" });
    }

    db.query("SELECT id FROM users WHERE email = ?", [email], async (checkErr, checkResult) => {
      if (checkErr) {
        return res.status(500).json({ error: checkErr.message });
      }

      if (checkResult.length > 0) {
        return res.status(400).json({ error: "Email already exists" });
      }

      const setupToken = crypto.randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

      const sql = `
        INSERT INTO users
          (tenant_id, full_name, email, password_hash, role, setup_token, setup_token_expires_at, is_password_set, is_active)
        VALUES (?, ?, ?, NULL, ?, ?, ?, FALSE, TRUE)
      `;

      db.query(
        sql,
        [tenantId, full_name, email, role || "staff", setupToken, expiresAt],
        async (err, result) => {
          if (err) {
            console.error("Create user error:", err);
            return res.status(500).json({ error: err.message });
          }

          try {
            await sendSetupPasswordEmail(email, full_name, setupToken);
          } catch (mailErr) {
            console.error("Send setup email error:", mailErr);
            return res.status(500).json({
              error: "User created but failed to send setup email",
              details: mailErr.message,
            });
          }

          res.json({
            message: "User created successfully. Setup email sent.",
            id: result.insertId,
          });
        }
      );
    });
  } catch (err) {
    console.error("Create user server error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

// ---------- CUSTOMERS ----------
app.get("/customers", authMiddleware, (req, res) => {
  const tenantId = req.currentTenantId;

  const sql = `
    SELECT id, tenant_id, full_name, address, phone_number, email
    FROM customers
    WHERE tenant_id = ?
    ORDER BY id DESC
  `;

  db.query(sql, [tenantId], (err, result) => {
    if (err) {
      console.error("Get customers error:", err);
      return res.status(500).json({ error: err.message });
    }
    res.json(result);
  });
});

app.post("/customers", authMiddleware, (req, res) => {
  const tenantId = req.currentTenantId;
  const { full_name, address, phone_number, email } = req.body;

  if (!full_name || !address || !phone_number || !email) {
    return res.status(400).json({ error: "All fields are required" });
  }

  const sql = `
    INSERT INTO customers (tenant_id, full_name, address, phone_number, email)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.query(sql, [tenantId, full_name, address, phone_number, email], (err, result) => {
    if (err) {
      console.error("Create customer error:", err);
      return res.status(500).json({ error: err.message });
    }

    res.json({
      message: "Customer created successfully",
      id: result.insertId,
    });
  });
});

app.put("/customers/:id", authMiddleware, (req, res) => {
  const tenantId = req.currentTenantId;
  const { id } = req.params;
  const { full_name, address, phone_number, email } = req.body;

  const sql = `
    UPDATE customers
    SET full_name = ?, address = ?, phone_number = ?, email = ?
    WHERE id = ? AND tenant_id = ?
  `;

  db.query(sql, [full_name, address, phone_number, email, id, tenantId], (err) => {
    if (err) {
      console.error("Update customer error:", err);
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: "Customer updated successfully" });
  });
});

app.delete("/customers/:id", authMiddleware, (req, res) => {
  const tenantId = req.currentTenantId;
  const { id } = req.params;

  const sql = "DELETE FROM customers WHERE id = ? AND tenant_id = ?";

  db.query(sql, [id, tenantId], (err) => {
    if (err) {
      console.error("Delete customer error:", err);
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: "Customer deleted successfully" });
  });
});

// ---------- EMAIL ----------
app.post("/send-email", authMiddleware, async (req, res) => {
  try {
    const { recipients, subject, message } = req.body;

    if (!recipients || recipients.length === 0) {
      return res.status(400).json({ error: "No recipients selected" });
    }

    if (!subject || !message) {
      return res.status(400).json({ error: "Subject and message are required" });
    }

    for (const email of recipients) {
      const command = new SendEmailCommand({
        Source: process.env.SENDER_EMAIL,
        Destination: {
          ToAddresses: [email],
        },
        Message: {
          Subject: {
            Data: subject,
          },
          Body: {
            Text: {
              Data: message,
            },
          },
        },
      });

      await ses.send(command);
    }

    res.json({ message: "Emails sent successfully" });
  } catch (err) {
    console.error("SES send error:", err);
    res.status(500).json({
      error: "Failed to send email",
      details: err.message,
    });
  }
});

// ---------- SMS ----------
app.post("/send-sms", authMiddleware, async (req, res) => {
  try {
    const { recipients, message } = req.body;

    if (!recipients || recipients.length === 0) {
      return res.status(400).json({ error: "No recipients selected" });
    }

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    console.log("Send SMS request:");
    console.log("Recipients:", recipients);
    console.log("Message:", message);

    res.json({
      message: "SMS request sent successfully",
      recipientsCount: recipients.length,
    });
  } catch (err) {
    console.error("SMS error:", err);
    res.status(500).json({ error: "Failed to send SMS" });
  }
});

// ---------- FRONTEND ----------
app.use((req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});