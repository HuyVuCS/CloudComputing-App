import { useState } from "react";

function SmsForm({ onSend = () => {}, selectedCount = 0 }) {
  const [message, setMessage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSend({ message });
    setMessage("");
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: "30px" }}>
      <h3>Send SMS</h3>
      <p>Selected customers: {selectedCount}</p>

      <textarea
        placeholder="SMS Message"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows="4"
        cols="50"
      />
      <br />

      <button type="submit">Send SMS</button>
    </form>
  );
}

export default SmsForm;