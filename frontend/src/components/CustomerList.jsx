function CustomerList({
  customers,
  onDelete = () => {},
  onEdit = () => {},
  selectedCustomers = [],
  onToggleSelect = () => {},
}) {
  return (
    <div>
      <h3>Customer List</h3>
      <table border="1" cellPadding="10">
        <thead>
          <tr>
            <th>Select</th>
            <th>Name</th>
            <th>Address</th>
            <th>Phone</th>
            <th>Email</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {customers.length === 0 ? (
            <tr>
              <td colSpan="6">No customers yet</td>
            </tr>
          ) : (
            customers.map((c) => (
              <tr key={c.id}>
                <td>
                  <input
                    type="checkbox"
                    checked={selectedCustomers.includes(c.id)}
                    onChange={() => onToggleSelect(c.id)}
                  />
                </td>
                <td>{c.full_name}</td>
                <td>{c.address}</td>
                <td>{c.phone_number}</td>
                <td>{c.email}</td>
                <td>
                  <button onClick={() => onEdit(c)}>Edit</button>{" "}
                  <button onClick={() => onDelete(c.id)}>Delete</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default CustomerList;