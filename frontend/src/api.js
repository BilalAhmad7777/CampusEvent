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



  login: (email, password) =>
    request("/api/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),

  verifyEmail: (email, otp) =>
  request("/api/auth/verify-email", {
    method: "POST",
    body: JSON.stringify({
      email,
      otp,
    }),
  }),

  resendOtp: (email) =>
  request("/api/auth/resend-otp", {
    method: "POST",
    body: JSON.stringify({
      email,
    }),
  }),


  me: () => request("/api/auth/me"),

  getCategories: () => request("/api/categories"),

  getEvents: (filters) => request(`/events${qs(filters)}`),
  getEvent: (id) => request(`/events/${id}`),
  createEvent: (payload) => request("/api/events", { method: "POST", body: JSON.stringify(payload) }),
  updateEvent: (id, payload) => request(`/events/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
  completeEvent: (id) =>
  request(`/events/${id}/complete`, {
    method: "POST",
  }),
  deleteEvent: (id) => request(`/events/${id}`, { method: "DELETE" }),

  registerForEvent: (id) => request(`/events/${id}/register`, { method: "POST" }),
  
  cancelRegistration: (id) => request(`/events/${id}/cancel`, { method: "POST" }),
  approveRegistration: (eventId, registrationId) =>
  request(`/events/${eventId}/approve-registration`, {
    method: "POST",
    body: JSON.stringify({
      registration_id: registrationId,
    }),
  }),

rejectRegistration: (eventId, registrationId, reason) =>
  request(`/events/${eventId}/reject-registration`, {
    method: "POST",
    body: JSON.stringify({
      registration_id: registrationId,
      reason,
    }),
  }),
  rateEvent: (id, data) =>
  request(`/events/${id}/rate`, {
    method: "POST",
    body: JSON.stringify(data),
  }),


  myRegistrations: () => request("/api/registrations/me"),
  myHistory: () => request("/api/registrations/history"),
  eventRegistrations: (id) => request(`/events/${id}/registrations`),
  markAttendance: (id, user_id, attended) =>
    request(`/events/${id}/attendance`, { method: "POST", body: JSON.stringify({ user_id, attended }) }),

  studentDashboard: () => request("/api/dashboard/student"),
  organizerDashboard: () => request("/api/dashboard/organizer"),
  adminDashboard: () => request("/api/dashboard/admin"),

  adminListUsers: () => request("/api/admin/users"),
  approveOrganizer: (id) => request(`/admin/users/${id}/approve`, { method: "POST" }),
  

  rejectOrganizer: (id, reason) =>
  request(`/admin/users/${id}/reject`, {
    method: "POST",
    body: JSON.stringify({ reason }),
  }),
  // rejectOrganizer: (id) => request(`/admin/users/${id}/reject`, { method: "POST" }),
  // verifyId: (id) =>
  // request(`/admin/users/${id}/verify-id`, {
  //   method: "POST",
  // }),
  scanAttendance: (eventId, registrationId) =>
  request(`/events/${eventId}/attendance`, {
    method: "POST",
    body: JSON.stringify({
      registration_id: registrationId,
    }),
  }),

// unverifyId: (id) =>
//   request(`/admin/users/${id}/unverify-id`, {
//     method: "POST",
//   }),
 deleteUser: (id, reason) =>
    request(`/admin/users/${id}`, {
        method: "DELETE",
        body: JSON.stringify({ reason }),
    }),
  // deleteUser: (id) => request(`/admin/users/${id}`, { method: "DELETE" }),
  adminDeleteEvent: (id) => request(`/admin/events/${id}`, { method: "DELETE" }),
sendDeleteOtp: () =>
  request("/api/account/send-delete-otp", {
    method: "POST",
  }),

deleteAccount: (otp) =>
  request("/api/account/delete", {
    method: "POST",
    body: JSON.stringify({ otp }),
  }),
registrationQr : (registrationId) =>
  `${API_BASE}/registrations/${registrationId}/qr`,
};

export { getToken, getUser };

