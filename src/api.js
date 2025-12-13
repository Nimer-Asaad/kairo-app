// src/api.js
export const API_URL = "http://localhost:5000";

async function parseResponse(res) {
  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    const json = await res.json().catch(() => ({}));
    return { kind: "json", data: json };
  }
  const text = await res.text().catch(() => "");
  return { kind: "text", data: text };
}

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

  const parsed = await parseResponse(res);
  const data = parsed.kind === "json" ? parsed.data : {};

  if (!res.ok) {
    const message =
      data.message ||
      data.error ||
      data.details ||
      (parsed.kind === "text" && typeof parsed.data === "string" ? parsed.data.trim() : "");
    throw new Error(message || `${res.status} ${res.statusText}` || "Server error");
  }

  return parsed.kind === "json" ? data : {};
}

// GET helper
export async function apiGet(path) {
  const res = await fetch(`${API_URL}${path}`, {
    headers: buildHeaders(false),
  });

  const parsed = await parseResponse(res);
  const data = parsed.kind === "json" ? parsed.data : {};

  if (!res.ok) {
    const message =
      data.message ||
      data.error ||
      data.details ||
      (parsed.kind === "text" && typeof parsed.data === "string" ? parsed.data.trim() : "");
    throw new Error(message || `${res.status} ${res.statusText}` || "Server error");
  }

  return parsed.kind === "json" ? data : {};
}
