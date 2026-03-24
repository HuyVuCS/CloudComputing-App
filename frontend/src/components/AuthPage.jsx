import { useState } from "react";
import { login, register } from "../services/api";

function AuthPage({ onAuthSuccess }) {
  const [mode, setMode] = useState("login");
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    let result;
    if (mode === "register") {
      result = await register(form);
    } else {
      result = await login({
        email: form.email,
        password: form.password,
      });
    }

    if (result.token) {
      localStorage.setItem("token", result.token);
      onAuthSuccess();
    } else {
      alert(result.error || "Authentication failed");
    }
  };

  return (
    <div className="app-shell" style={{ maxWidth: "520px" }}>
      <div className="card">
        <h3>{mode === "login" ? "Login" : "Register Tenant Admin"}</h3>
        <p className="helper">
          {mode === "login"
            ? "Login to access your tenant workspace."
            : "Create a new tenant and an admin account."}
        </p>

        <form onSubmit={handleSubmit}>
          {mode === "register" && (
            <>
              <div className="form-group">
                <label className="label">Tenant Name</label>
                <input
                  className="input"
                  name="tenant_name"
                  value={form.tenant_name}
                  onChange={handleChange}
                  placeholder="Enter tenant/company name"
                />
              </div>

              <div className="form-group">
                <label className="label">Full Name</label>
                <input
                  className="input"
                  name="full_name"
                  value={form.full_name}
                  onChange={handleChange}
                  placeholder="Enter admin full name"
                />
              </div>
            </>
          )}

          <div className="form-group">
            <label className="label">Email</label>
            <input
              className="input"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Enter email"
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
              placeholder="Enter password"
            />
          </div>

          <div className="button-row">
            <button className="btn btn-primary" type="submit">
              {mode === "login" ? "Login" : "Register"}
            </button>

            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setMode(mode === "login" ? "register" : "login")}
            >
              {mode === "login" ? "Switch to Register" : "Switch to Login"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AuthPage;