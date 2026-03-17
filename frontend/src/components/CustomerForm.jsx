import { useEffect, useState } from "react";

function CustomerForm({ onAdd = () => {}, onUpdate = () => {}, editingCustomer = null }) {
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

  const handleSubmit = (e) => {
    e.preventDefault();

    if (editingCustomer) {
      onUpdate(editingCustomer.id, form);
    } else {
      onAdd(form);
    }

    setForm({
      full_name: "",
      address: "",
      phone_number: "",
      email: "",
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>{editingCustomer ? "Edit Customer" : "Add Customer"}</h3>

      <input
        name="full_name"
        placeholder="Full Name"
        value={form.full_name}
        onChange={handleChange}
      />
      <br />

      <input
        name="address"
        placeholder="Address"
        value={form.address}
        onChange={handleChange}
      />
      <br />

      <input
        name="phone_number"
        placeholder="Phone"
        value={form.phone_number}
        onChange={handleChange}
      />
      <br />

      <input
        name="email"
        placeholder="Email"
        value={form.email}
        onChange={handleChange}
      />
      <br />

      <button type="submit">
        {editingCustomer ? "Update" : "Add"}
      </button>
    </form>
  );
}

export default CustomerForm;