import { useEffect, useState } from "react";
import AuthPage from "../components/AuthPage";
import SetupPasswordPage from "../components/SetupPasswordPage";
import CustomerForm from "../components/CustomerForm";
import CustomerList from "../components/CustomerList";
import EmailForm from "../components/EmailForm";
import SmsForm from "../components/SmsForm";
import UserManagement from "../components/UserManagement";
import {
  getCustomers,
  createCustomer,
  deleteCustomer,
  updateCustomer,
  sendEmail,
  sendSms,
  getMe,
} from "../services/api";

function CustomerPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem("token")
  );
  const [loading, setLoading] = useState(true);

  const [customers, setCustomers] = useState([]);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [selectedCustomers, setSelectedCustomers] = useState([]);

  const [currentTenantId, setCurrentTenantId] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  const fetchData = async () => {
    try {
      const data = await getCustomers();
      setCustomers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Fetch customers error:", err);
      setCustomers([]);
    }
  };

  const fetchContext = async () => {
    try {
      const data = await getMe();

      if (data?.currentUser) {
        setCurrentTenantId(data.currentTenantId ?? null);
        setCurrentUser(data.currentUser ?? null);
      } else {
        localStorage.removeItem("token");
        setIsAuthenticated(false);
      }
    } catch (err) {
      console.error("Fetch context error:", err);
      localStorage.removeItem("token");
      setIsAuthenticated(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }

      setLoading(true);
      await fetchContext();
      await fetchData();
      setLoading(false);
    };

    init();
  }, [isAuthenticated]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
    setCustomers([]);
    setSelectedCustomers([]);
    setCurrentTenantId(null);
    setCurrentUser(null);
    setEditingCustomer(null);
  };

  const handleAdd = async (form) => {
    try {
      await createCustomer(form);
      await fetchData();
    } catch (err) {
      console.error("Create error:", err);
      alert("Failed to create customer");
    }
  };

  const handleUpdate = async (id, form) => {
    try {
      await updateCustomer(id, form);
      setEditingCustomer(null);
      await fetchData();
    } catch (err) {
      console.error("Update error:", err);
      alert("Failed to update customer");
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteCustomer(id);
      setSelectedCustomers((prev) => prev.filter((item) => item !== id));
      await fetchData();
    } catch (err) {
      console.error("Delete error:", err);
      alert("Failed to delete customer");
    }
  };

  const handleEdit = (customer) => {
    setEditingCustomer(customer);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleToggleSelect = (id) => {
    setSelectedCustomers((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    setSelectedCustomers(customers.map((c) => c.id));
  };

  const handleClearSelection = () => {
    setSelectedCustomers([]);
  };

  const handleSendEmail = async ({ subject, message }) => {
    if (selectedCustomers.length === 0) {
      alert("Please select at least one customer");
      return;
    }

    try {
      const recipients = customers
        .filter((c) => selectedCustomers.includes(c.id))
        .map((c) => c.email)
        .filter(Boolean);

      const result = await sendEmail({
        recipients,
        subject,
        message,
      });

      alert(result.message || "Email request sent");
    } catch (err) {
      console.error("Send email error:", err);
      alert("Failed to send email");
    }
  };

  const handleSendSms = async ({ message }) => {
    if (selectedCustomers.length === 0) {
      alert("Please select at least one customer");
      return;
    }

    try {
      const recipients = customers
        .filter((c) => selectedCustomers.includes(c.id))
        .map((c) => c.phone_number)
        .filter(Boolean);

      const result = await sendSms({
        recipients,
        message,
      });

      alert(result.message || "SMS request sent");
    } catch (err) {
      console.error("Send SMS error:", err);
      alert("Failed to send SMS");
    }
  };

  if (window.location.pathname === "/setup-password") {
    return <SetupPasswordPage />;
  }

  if (!isAuthenticated) {
    return <AuthPage onAuthSuccess={() => setIsAuthenticated(true)} />;
  }

  if (loading) {
    return (
      <div className="app-shell">
        <div className="card">
          <h2>Loading...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <div className="page-header">
        <div>
          <h1 className="page-title">Customer Management System</h1>
          <p className="page-subtitle">
            Tenant ID: {currentTenantId ?? "-"} | Current User:{" "}
            {currentUser?.full_name ?? "-"} ({currentUser?.role ?? "-"})
          </p>
        </div>

        <button className="btn btn-danger" onClick={handleLogout}>
          Logout
        </button>
      </div>

      <div className="top-grid">
        <CustomerForm
          onAdd={handleAdd}
          onUpdate={handleUpdate}
          editingCustomer={editingCustomer}
        />

        <EmailForm
          onSend={handleSendEmail}
          selectedCount={selectedCustomers.length}
        />

        <SmsForm
          onSend={handleSendSms}
          selectedCount={selectedCustomers.length}
        />
      </div>

      <div className="toolbar">
        <div className="toolbar-left">
          <button className="btn btn-primary" onClick={handleSelectAll}>
            Select All
          </button>
          <button className="btn btn-secondary" onClick={handleClearSelection}>
            Clear Selection
          </button>
        </div>

        <div className="toolbar-right">
          <div className="badge">
            Selected customers: {selectedCustomers.length}
          </div>
        </div>
      </div>

      <div className="card">
        <CustomerList
          customers={customers}
          onDelete={handleDelete}
          onEdit={handleEdit}
          selectedCustomers={selectedCustomers}
          onToggleSelect={handleToggleSelect}
        />
      </div>

      <UserManagement
        currentUser={currentUser}
        currentTenantId={currentTenantId}
      />
    </div>
  );
}

export default CustomerPage;