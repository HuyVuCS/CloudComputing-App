import { useEffect, useState } from "react";
import { getUsers, createUser } from "../services/api";

function UserManagement({ currentUser, currentTenantId }) {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    role: "staff",
  });

  const fetchUsers = async () => {
    try {
      const data = await getUsers();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Get users error:", err);
      setUsers([]);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const result = await createUser(form);

    if (result.message) {
      alert(result.message);
      setForm({
        full_name: "",
        email: "",
        role: "staff",
      });
      fetchUsers();
    } else {
      alert(result.error || "Failed to create user");
    }
  };

  return (
    <div className="card" style={{ marginTop: "24px" }}>
      <h3>Tenant User Management</h3>
      <p className="helper">
        Tenant ID: {currentTenantId} | Current User: {currentUser?.full_name} ({currentUser?.role})
      </p>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="label">Full Name</label>
          <input
            className="input"
            name="full_name"
            value={form.full_name}
            onChange={handleChange}
            placeholder="Enter user full name"
          />
        </div>

        <div className="form-group">
          <label className="label">Email</label>
          <input
            className="input"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Enter user email"
          />
        </div>

        <div className="form-group">
          <label className="label">Role</label>
          <select
            className="input"
            name="role"
            value={form.role}
            onChange={handleChange}
          >
            <option value="staff">Staff</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <div className="button-row">
          <button className="btn btn-primary" type="submit">
            Create User & Send Setup Email
          </button>
        </div>
      </form>

      <div style={{ marginTop: "20px" }}>
        <h4>Users in Tenant</h4>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Tenant ID</th>
                <th>Full Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Password Set</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan="6" className="empty-state">
                    No users found.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id}>
                    <td>{u.id}</td>
                    <td>{u.tenant_id}</td>
                    <td>{u.full_name}</td>
                    <td>{u.email}</td>
                    <td>{u.role}</td>
                    <td>{u.is_password_set ? "Yes" : "No"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default UserManagement;