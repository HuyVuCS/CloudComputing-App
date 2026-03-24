const BASE_URL = "";

function getToken() {
  return localStorage.getItem("token");
}

function authHeaders() {
  const token = getToken();
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

export async function register(data) {
  const res = await fetch(`${BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function login(data) {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function validateSetupToken(token) {
  const res = await fetch(`${BASE_URL}/auth/setup-password/${token}`);
  return res.json();
}

export async function setupPassword(data) {
  const res = await fetch(`${BASE_URL}/auth/setup-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function getMe() {
  const res = await fetch(`${BASE_URL}/me`, {
    headers: authHeaders(),
  });
  return res.json();
}

export async function getUsers() {
  const res = await fetch(`${BASE_URL}/users`, {
    headers: authHeaders(),
  });
  return res.json();
}

export async function createUser(data) {
  const res = await fetch(`${BASE_URL}/users`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function getCustomers() {
  const res = await fetch(`${BASE_URL}/customers`, {
    headers: authHeaders(),
  });
  return res.json();
}

export async function createCustomer(data) {
  const res = await fetch(`${BASE_URL}/customers`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function deleteCustomer(id) {
  const res = await fetch(`${BASE_URL}/customers/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  return res.json();
}

export async function updateCustomer(id, data) {
  const res = await fetch(`${BASE_URL}/customers/${id}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function sendEmail(data) {
  const res = await fetch(`${BASE_URL}/send-email`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function sendSms(data) {
  const res = await fetch(`${BASE_URL}/send-sms`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return res.json();
}