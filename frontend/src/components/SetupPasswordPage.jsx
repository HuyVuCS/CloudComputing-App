import { useEffect, useState } from "react";
import { setupPassword, validateSetupToken } from "../services/api";

function SetupPasswordPage() {
  const [tokenStatus, setTokenStatus] = useState("loading");
  const [token, setToken] = useState("");
  const [userInfo, setUserInfo] = useState(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const tokenValue = params.get("token");

        if (!tokenValue) {
          setTokenStatus("invalid");
          return;
        }

        setToken(tokenValue);

        const result = await validateSetupToken(tokenValue);

        if (result?.user) {
          setUserInfo(result.user);
          setTokenStatus("valid");
        } else {
          setTokenStatus("invalid");
        }
      } catch (err) {
        console.error("Validate setup token error:", err);
        setTokenStatus("invalid");
      }
    };

    init();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!password || !confirmPassword) {
      alert("Please fill in all password fields");
      return;
    }

    if (password.length < 6) {
      alert("Password must be at least 6 characters");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      setSubmitting(true);

      const result = await setupPassword({
        token,
        password,
      });

      if (result?.message) {
        alert("Password has been set successfully. Please login.");
        window.location.href = "/";
        return;
      }

      alert(result?.error || "Failed to set password");
    } catch (err) {
      console.error("Setup password error:", err);
      alert("Failed to set password");
    } finally {
      setSubmitting(false);
    }
  };

  if (tokenStatus === "loading") {
    return (
      <div className="auth-shell">
        <div className="auth-card">
          <h2 className="auth-title" style={{ marginBottom: 8 }}>
            Validating setup link...
          </h2>
          <p className="auth-subtitle">
            Please wait while we verify your account invitation.
          </p>
        </div>
      </div>
    );
  }

  if (tokenStatus === "invalid") {
    return (
      <div className="auth-shell">
        <div className="auth-card">
          <div className="auth-brand">
            <div className="auth-brand-badge">!</div>
            <div>
              <h1 className="auth-title">Invalid or Expired Link</h1>
              <p className="auth-subtitle">
                This password setup link is no longer valid. Please contact your
                tenant administrator to request a new invitation.
              </p>
            </div>
          </div>

          <div className="button-row" style={{ marginTop: 16 }}>
            <button
              className="btn btn-secondary"
              type="button"
              onClick={() => {
                window.location.href = "/";
              }}
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <div className="auth-brand">
          <div className="auth-brand-badge">PW</div>
          <div>
            <h1 className="auth-title">Set Your Password</h1>
            <p className="auth-subtitle">
              Welcome{" "}
              <strong>
                {userInfo?.full_name || "User"}
              </strong>
              {" • "}
              {userInfo?.email || ""}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="label">New Password</label>
            <input
              className="input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter new password"
              required
            />
          </div>

          <div className="form-group">
            <label className="label">Confirm Password</label>
            <input
              className="input"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter password"
              required
            />
          </div>

          <div className="button-row" style={{ marginTop: 16 }}>
            <button
              className="btn btn-primary"
              type="submit"
              disabled={submitting}
            >
              {submitting ? "Saving..." : "Set Password"}
            </button>

            <button
              className="btn btn-secondary"
              type="button"
              onClick={() => {
                window.location.href = "/";
              }}
              disabled={submitting}
            >
              Back
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SetupPasswordPage;