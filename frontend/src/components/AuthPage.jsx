import { useState } from "react";
import { login, register } from "../services/api";

function AuthPage({ onAuthSuccess }) {
  const [mode, setMode] = useState("login");
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    tenant_name: "",
    full_name: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setForm({
      tenant_name: "",
      full_name: "",
      email: "",
      password: "",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSubmitting(true);

      let result;
      if (mode === "register") {
        result = await register(form);
      } else {
        result = await login({
          email: form.email,
          password: form.password,
        });
      }

      if (result?.token) {
        localStorage.setItem("token", result.token);
        onAuthSuccess();
        return;
      }

      alert(result?.error || "Authentication failed");
    } catch (err) {
      console.error("Auth error:", err);
      alert("Authentication failed");
    } finally {
      setSubmitting(false);
    }
  };

  const switchMode = () => {
    setMode((prev) => (prev === "login" ? "register" : "login"));
    resetForm();
  };

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <div className="auth-brand">
          <div className="auth-brand-badge">CMS</div>
          <div>
            <h1 className="auth-title">Customer Management System</h1>
            <p className="auth-subtitle">
              {mode === "login"
                ? "Sign in to access your tenant workspace."
                : "Create a new tenant and admin account."}
            </p>
          </div>
        </div>

        <div className="auth-tabs">
          <button
            type="button"
            className={`auth-tab ${mode === "login" ? "active" : ""}`}
            onClick={() => setMode("login")}
          >
            Login
          </button>
          <button
            type="button"
            className={`auth-tab ${mode === "register" ? "active" : ""}`}
            onClick={() => setMode("register")}
          >
            Register
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {mode === "register" && (
            <>
              <div className="form-group">
                <label className="label">Tenant / Company Name</label>
                <input
                  className="input"
                  name="tenant_name"
                  value={form.tenant_name}
                  onChange={handleChange}
                  placeholder="Enter tenant or company name"
                  required
                />
              </div>

              <div className="form-group">
                <label className="label">Admin Full Name</label>
                <input
                  className="input"
                  name="full_name"
                  value={form.full_name}
                  onChange={handleChange}
                  placeholder="Enter admin full name"
                  required
                />
              </div>
            </>
          )}

          <div className="form-group">
            <label className="label">Email</label>
            <input
              className="input"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Enter email"
              required
            />
          </div>

          <div className="form-group">
            <label className="label">Password</label>
            <input
              className="input"
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder={
                mode === "login" ? "Enter your password" : "Create a password"
              }
              required
            />
          </div>

          <div className="button-row" style={{ marginTop: 16 }}>
            <button
              className="btn btn-primary"
              type="submit"
              disabled={submitting}
            >
              {submitting
                ? "Please wait..."
                : mode === "login"
                ? "Login"
                : "Register"}
            </button>

            <button
              type="button"
              className="btn btn-secondary"
              onClick={switchMode}
              disabled={submitting}
            >
              {mode === "login" ? "Create new tenant" : "Back to login"}
            </button>
          </div>
        </form>

        <div className="auth-footer">
          {mode === "login" ? (
            <p>
              Need a new workspace?{" "}
              <button type="button" className="auth-link-btn" onClick={switchMode}>
                Register tenant admin
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{" "}
              <button type="button" className="auth-link-btn" onClick={switchMode}>
                Login here
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default AuthPage;