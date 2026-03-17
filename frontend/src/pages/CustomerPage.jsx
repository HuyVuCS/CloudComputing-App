import { useEffect, useState } from "react";
import CustomerForm from "../components/CustomerForm";
import CustomerList from "../components/CustomerList";
import EmailForm from "../components/EmailForm";
import SmsForm from "../components/SmsForm";
import { sendSms } from "../services/api";
import {
  getCustomers,
  createCustomer,
  deleteCustomer,
  updateCustomer,
  sendEmail,
} from "../services/api";

function CustomerPage() {
  const [customers, setCustomers] = useState([]);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [selectedCustomers, setSelectedCustomers] = useState([]);

  const fetchData = async () => {
    try {
      const data = await getCustomers();
      setCustomers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Fetch error:", err);
      setCustomers([]);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAdd = async (form) => {
    try {
      await createCustomer(form);
      fetchData();
    } catch (err) {
      console.error("Create error:", err);
    }
  };

  const handleUpdate = async (id, form) => {
    try {
      await updateCustomer(id, form);
      setEditingCustomer(null);
      fetchData();
    } catch (err) {
      console.error("Update error:", err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteCustomer(id);
      setSelectedCustomers((prev) => prev.filter((item) => item !== id));
      fetchData();
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const handleEdit = (customer) => {
    setEditingCustomer(customer);
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
        .map((c) => c.email);

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

  return (
    <div style={{ padding: "20px" }}>
      <h1>Customer Management</h1>

      <CustomerForm
        onAdd={handleAdd}
        onUpdate={handleUpdate}
        editingCustomer={editingCustomer}
      />

      <div style={{ margin: "20px 0" }}>
        <button onClick={handleSelectAll}>Select All</button>{" "}
        <button onClick={handleClearSelection}>Clear Selection</button>
        <p>Selected customers: {selectedCustomers.length}</p>
      </div>

      <CustomerList
        customers={customers}
        onDelete={handleDelete}
        onEdit={handleEdit}
        selectedCustomers={selectedCustomers}
        onToggleSelect={handleToggleSelect}
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
  );
}

const handleSendSms = async ({ message }) => {
  if (selectedCustomers.length === 0) {
    alert("Please select at least one customer");
    return;
  }

  try {
    const recipients = customers
      .filter((c) => selectedCustomers.includes(c.id))
      .map((c) => c.phone_number);

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

export default CustomerPage;