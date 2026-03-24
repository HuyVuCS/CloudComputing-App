import { useEffect, useState } from "react";

function CustomerForm({ onAdd, onUpdate, editingCustomer }) {
  const [form, setForm] = useState({
    full_name: "",
    address: "",
    phone_number: "",
    email: "",
  });

  useEffect(() => {
    if (editingCustomer) {
      setForm({
        full_name: editingCustomer.full_name || "",
        address: editingCustomer.address || "",
        phone_number: editingCustomer.phone_number || "",
        email: editingCustomer.email || "",
      });
    } else {
      setForm({
        full_name: "",
        address: "",
        phone_number: "",
        email: "",
      });
    }
  }, [editingCustomer]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setForm({
      full_name: "",
      address: "",
      phone_number: "",
      email: "",
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (
      !form.full_name.trim() ||
      !form.address.trim() ||
      !form.phone_number.trim() ||
      !form.email.trim()
    ) {
      alert("Please fill in all customer fields");
      return;
    }

    if (editingCustomer) {
      onUpdate(editingCustomer.id, form);
    } else {
      onAdd(form);
    }

    resetForm();
  };

  return (
    <div className="card form-card">
      <h3>{editingCustomer ? "Update Customer" : "Add Customer"}</h3>
      <p className="helper">
        {editingCustomer
          ? "Edit the selected customer information."
          : "Create a new customer record in your tenant workspace."}
      </p>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="label">Full Name</label>
          <input
            className="input"
            type="text"
            name="full_name"
            value={form.full_name}
            onChange={handleChange}
            placeholder="Enter customer full name"
          />
        </div>

        <div className="form-group">
          <label className="label">Address</label>
          <input
            className="input"
            type="text"
            name="address"
            value={form.address}
            onChange={handleChange}
            placeholder="Enter address"
          />
        </div>

        <div className="form-group">
          <label className="label">Phone</label>
          <input
            className="input"
            type="text"
            name="phone_number"
            value={form.phone_number}
            onChange={handleChange}
            placeholder="Enter phone number"
          />
        </div>

        <div className="form-group">
          <label className="label">Email</label>
          <input
            className="input"
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Enter email"
          />
        </div>

        <div className="button-row">
          <button className="btn btn-primary" type="submit">
            {editingCustomer ? "Update Customer" : "Add Customer"}
          </button>

          <button
            className="btn btn-secondary"
            type="button"
            onClick={resetForm}
          >
            Clear
          </button>
        </div>
      </form>
    </div>
  );
}

export default CustomerForm;