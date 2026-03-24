import { useEffect, useState } from "react";
import { validateSetupToken, setupPassword } from "../services/api";

function SetupPasswordPage() {
  const [tokenStatus, setTokenStatus] = useState("loading");
  const [token, setToken] = useState("");
  const [userInfo, setUserInfo] = useState(null);
  const [password, setPassword] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tokenValue = params.get("token");

    if (!tokenValue) {
      setTokenStatus("invalid");
      return;
    }

    setToken(tokenValue);

    validateSetupToken(tokenValue).then((result) => {
      if (result.user) {
        setUserInfo(result.user);
        setTokenStatus("valid");
      } else {
        setTokenStatus("invalid");
      }
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const result = await setupPassword({ token, password });

    if (result.message) {
      alert("Password has been set successfully. Please login.");
      window.location.href = "/";
    } else {
      alert(result.error || "Failed to set password");
    }
  };

  if (tokenStatus === "loading") {
    return (
      <div className="app-shell" style={{ maxWidth: "520px" }}>
        <div className="card">
          <h3>Validating token...</h3>
        </div>
      </div>
    );
  }

  if (tokenStatus === "invalid") {
    return (
      <div className="app-shell" style={{ maxWidth: "520px" }}>
        <div className="card">
          <h3>Invalid or expired setup link</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell" style={{ maxWidth: "520px" }}>
      <div className="card">
        <h3>Set Your Password</h3>
        <p className="helper">
          Welcome {userInfo?.full_name} ({userInfo?.email})
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="label">New Password</label>
            <input
              className="input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your new password"
            />
          </div>

          <div className="button-row">
            <button className="btn btn-primary" type="submit">
              Set Password
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SetupPasswordPage;