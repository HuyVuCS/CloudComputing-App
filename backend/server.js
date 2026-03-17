const path = require("path");
const express = require("express");
const cors = require("cors");
require("dotenv").config();
const db = require("./db");

const app = express();
app.use(express.static(path.join(__dirname, "../frontend/dist")));

app.use(cors());
app.use(express.json());

app.get("/customers", (req, res) => {
  const sql = "SELECT * FROM customers ORDER BY id DESC";
  db.query(sql, (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(result);
  });
});

app.post("/customers", (req, res) => {
  const { full_name, address, phone_number, email } = req.body;

  const sql =
    "INSERT INTO customers (full_name, address, phone_number, email) VALUES (?, ?, ?, ?)";
  db.query(sql, [full_name, address, phone_number, email], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({
      message: "Customer created successfully",
      id: result.insertId,
    });
  });
});

app.put("/customers/:id", (req, res) => {
  const { id } = req.params;
  const { full_name, address, phone_number, email } = req.body;

  const sql =
    "UPDATE customers SET full_name = ?, address = ?, phone_number = ?, email = ? WHERE id = ?";
  db.query(sql, [full_name, address, phone_number, email, id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: "Customer updated successfully" });
  });
});

app.delete("/customers/:id", (req, res) => {
  const { id } = req.params;

  const sql = "DELETE FROM customers WHERE id = ?";
  db.query(sql, [id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: "Customer deleted successfully" });
  });
});

const PORT = process.env.PORT || 5000;
app.post("/send-email", async (req, res) => {
  const { recipients, subject, message } = req.body;

  if (!recipients || recipients.length === 0) {
    return res.status(400).json({ error: "No recipients selected" });
  }

  if (!subject || !message) {
    return res.status(400).json({ error: "Subject and message are required" });
  }

  console.log("Send email request:");
  console.log("Recipients:", recipients);
  console.log("Subject:", subject);
  console.log("Message:", message);

  return res.json({
    message: "Email request received successfully",
    recipientsCount: recipients.length,
  });
});

app.post("/send-sms", async (req, res) => {
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

  return res.json({
    message: "SMS request received successfully",
    recipientsCount: recipients.length,
  });
});

app.use((req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});