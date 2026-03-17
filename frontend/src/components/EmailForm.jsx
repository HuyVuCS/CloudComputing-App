import { useState } from "react";

function EmailForm({ onSend = () => {}, selectedCount = 0 }) {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSend({ subject, message });
    setSubject("");
    setMessage("");
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: "30px" }}>
      <h3>Send Email</h3>
      <p>Selected customers: {selectedCount}</p>

      <input
        type="text"
        placeholder="Email Subject"
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
      />
      <br />

      <textarea
        placeholder="Email Message"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows="5"
        cols="50"
      />
      <br />

      <button type="submit">Send Email</button>
    </form>
  );
}

export default EmailForm;