const BASE_URL = "";

export async function getCustomers() {
  const res = await fetch(`${BASE_URL}/customers`);
  return res.json();
}

export async function createCustomer(data) {
  const res = await fetch(`${BASE_URL}/customers`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function deleteCustomer(id) {
  const res = await fetch(`${BASE_URL}/customers/${id}`, {
    method: "DELETE",
  });
  return res.json();
}

export async function updateCustomer(id, data) {
  const res = await fetch(`${BASE_URL}/customers/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function sendEmail(data) {
  const res = await fetch(`${BASE_URL}/send-email`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function sendSms(data) {
  const res = await fetch(`${BASE_URL}/send-sms`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  return res.json();
}