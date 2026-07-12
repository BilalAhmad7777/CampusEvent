const API_BASE = "https://deploy-test-l975.onrender.com";

function getToken() {
  return localStorage.getItem("token");
}
function getUser() {
  const raw = localStorage.getItem("user");
  return raw ? JSON.parse(raw) : null;
}

async function request(path, options = {}) {
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
  const token = getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;
  console.log("Request URL:", `${API_BASE}${path}`);
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}

function qs(params = {}) {
  const clean = Object.fromEntries(Object.entries(params).filter(([, v]) => v));
  const s = new URLSearchParams(clean).toString();
  return s ? `?${s}` : "";
}

export const api = {
  signup: (
    email,
    password,
    name,
    role,
    rollNumber,
    profilePhoto,
    collegeId,
    college
  ) =>
    request("/api/auth/signup", {
      method: "POST",
      body: JSON.stringify({
        email,
        password,
        name,
        role,
        roll_number: rollNumber,
        profile_photo: profilePhoto,
        college_id: collegeId,
        college,
      }),
    }),

  // FIX: this was defined twice (identical bodies) — JS silently used the
  // second one, so nothing broke, but it was dead code. Kept one copy.
  login: (email, password, role) =>
    request("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email,
        password,
        role,
      }),
    }),

  verifyEmail: (email, otp) =>
    request("/api/auth/verify-email", {
      method: "POST",
      body: JSON.stringify({
        email,
        otp,
      }),
    }),

  // FIX: also duplicated — kept one copy.
  resendOtp: (email) =>
    request("/api/auth/resend-otp", {
      method: "POST",
      body: JSON.stringify({
        email,
      }),
    }),

  me: () => request("/api/auth/me"),

  getCategories: () => request("/api/categories"),

  getEvents: (filters) => request(`/api/events${qs(filters)}`),
  getEvent: (id) => request(`/api/events/${id}`),
  createEvent: (payload) => request("/api/events", { method: "POST", body: JSON.stringify(payload) }),
  updateEvent: (id, payload) => request(`/api/events/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
  completeEvent: (id) =>
    request(`/api/events/${id}/complete`, {
      method: "POST",
    }),
  deleteEvent: (id, reason) =>
    request(`/api/events/${id}`, {
      method: "DELETE",
      body: JSON.stringify({
        reason,
      }),
    }),

  registerForEvent: (id) => request(`/api/events/${id}/register`, { method: "POST" }),

  cancelRegistration: (id) => request(`/api/events/${id}/cancel`, { method: "POST" }),
  approveRegistration: (eventId, registrationId) =>
    request(`/api/events/${eventId}/approve-registration`, {
      method: "POST",
      body: JSON.stringify({
        registration_id: registrationId,
      }),
    }),

  rejectRegistration: (eventId, registrationId, reason) =>
    request(`/api/events/${eventId}/reject-registration`, {
      method: "POST",
      body: JSON.stringify({
        registration_id: registrationId,
        reason,
      }),
    }),
  rateEvent: (id, data) =>
    request(`/api/events/${id}/rate`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  myRegistrations: () => request("/api/registrations/me"),
  myHistory: () => request("/api/registrations/history"),
  eventRegistrations: (id) => request(`/api/events/${id}/registrations`),

  // FIX: backend's /attendance route reads `registration_id` from the JSON
  // body (it looks the registration up by registration_id + event_id +
  // status=="registered"), but this used to send `user_id`. The key never
  // matched, so registration_id was always None server-side and every
  // manual "Mark attended" click failed with "Invalid ticket". Renamed the
  // param and the body key to match the backend.
  markAttendance: (id, registrationId, attended) =>
    request(`/api/events/${id}/attendance`, {
      method: "POST",
      body: JSON.stringify({ registration_id: registrationId, attended }),
    }),

  studentDashboard: () => request("/api/dashboard/student"),
  organizerDashboard: () => request("/api/dashboard/organizer"),
  adminDashboard: () => request("/api/dashboard/admin"),

  adminListUsers: () => request("/api/admin/users"),
  approveOrganizer: (id) => request(`/api/admin/users/${id}/approve`, { method: "POST" }),

  rejectOrganizer: (id, reason) =>
    request(`/api/admin/users/${id}/reject`, {
      method: "POST",
      body: JSON.stringify({ reason }),
    }),

  scanAttendance: (eventId, registrationId) =>
    request(`/api/events/${eventId}/attendance`, {
      method: "POST",
      body: JSON.stringify({
        registration_id: registrationId,
      }),
    }),

  deleteUser: (id, reason) =>
    request(`/api/admin/users/${id}`, {
      method: "DELETE",
      body: JSON.stringify({ reason }),
    }),
  adminDeleteEvent: (id, reason) =>
    request(`/api/admin/events/${id}`, {
      method: "DELETE",
      body: JSON.stringify({ reason }),
    }),
  sendDeleteOtp: () =>
    request("/api/account/send-delete-otp", {
      method: "POST",
    }),

  deleteAccount: (otp) =>
    request("/api/account/delete", {
      method: "POST",
      body: JSON.stringify({ otp }),
    }),
  registrationQr: (registrationId) =>
    `${API_BASE}/api/registrations/${registrationId}/qr`,
};

export { getToken, getUser };