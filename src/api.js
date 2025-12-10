// src/api.js
export const API_URL = "http://localhost:5000";

function buildHeaders(isJson = true) {
  const headers = {};
  if (isJson) headers["Content-Type"] = "application/json";

  const token = localStorage.getItem("token");
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return headers;
}

export async function apiPost(path, body) {
  const res = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: buildHeaders(true),
    body: JSON.stringify(body),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || "Server error");
  }

  return data;
}

// GET helper
export async function apiGet(path) {
  const res = await fetch(`${API_URL}${path}`, {
    headers: buildHeaders(false),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || "Server error");
  }

  return data;
}
