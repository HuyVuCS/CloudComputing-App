import { useState } from "react";

function EmailForm({ onSend, selectedCount }) {
  const [form, setForm] = useState({
    subject: "",
    message: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.subject.trim() || !form.message.trim()) {
      alert("Please enter both subject and message");
      return;
    }

    onSend(form);
  };

  return (
    <div className="card form-card">
      <h3>Send Email</h3>
      <p className="helper">Selected customers: {selectedCount}</p>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="label">Email Subject</label>
          <input
            className="input"
            type="text"
            name="subject"
            value={form.subject}
            onChange={handleChange}
            placeholder="Enter email subject"
          />
        </div>

        <div className="form-group">
          <label className="label">Email Message</label>
          <textarea
            className="input"
            name="message"
            value={form.message}
            onChange={handleChange}
            placeholder="Enter email message"
          />
        </div>

        <div className="button-row">
          <button className="btn btn-primary" type="submit">
            Send Email
          </button>
        </div>
      </form>
    </div>
  );
}

export default EmailForm;