import { useState } from "react";

function SmsForm({ onSend, selectedCount }) {
  const [message, setMessage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!message.trim()) {
      alert("Please enter SMS message");
      return;
    }

    onSend({ message });
  };

  return (
    <div className="card form-card">
      <h3>Send SMS</h3>
      <p className="helper">Selected customers: {selectedCount}</p>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="label">SMS Message</label>
          <textarea
            className="input"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Enter SMS message"
          />
        </div>

        <div className="button-row">
          <button className="btn btn-primary" type="submit">
            Send SMS
          </button>
        </div>
      </form>
    </div>
  );
}

export default SmsForm;