const BASE_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000/api';

export async function api(method, path, body, token) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const opts = { method, headers };
  if (body != null) opts.body = JSON.stringify(body);
  const res = await fetch(`${BASE_URL}${path}`, opts);
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const msg = data?.detail || data?.message || data?.error || `Request failed (${res.status})`;
    throw new Error(msg);
  }
  return data;
}

export async function getDriverProfile(token) {
  return api('GET', '/driver/me/', null, token);
}

export async function updateDriverProfile(token, updates) {
  return api('PATCH', '/driver/me/', updates, token);
}

export async function saveTripRecord(token, tripData) {
  return api('POST', '/history/', tripData, token);
}

export async function getTripRecords(token) {
  return api('GET', '/history/', null, token);
}

export async function deleteTripRecord(token, id) {
  return api('DELETE', `/history/${id}/`, null, token);
}

export async function optimizeTrip(token, tripData) {
  return api('POST', '/trips/optimize/', tripData, token);
}
