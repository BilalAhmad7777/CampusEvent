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



  login: (email, password, role) =>
  request("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({
      email,
      password,
      role,
    }),
  }),

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

resendOtp: (email) =>
  request("/api/auth/resend-otp", {
    method: "POST",
    body: JSON.stringify({
      email,
    }),
  }),

  resendOtp: (email) =>
  request("/api/auth/resend-otp", {
    method: "POST",
    body: JSON.stringify({
      email,
    }),
  }),
  forgotPassword: (email) =>
  request("/api/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({
      email,
    }),
  }),

resetPassword: (email, otp, newPassword) =>
  request("/api/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({
      email,
      otp,
      new_password: newPassword,
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


  report: (payload) =>
  request("/api/reports", {
    method: "POST",
    body: JSON.stringify(payload),
  }),


  myRegistrations: () => request("/api/registrations/me"),
  myHistory: () => request("/api/registrations/history"),
  eventRegistrations: (id) => request(`/api/events/${id}/registrations`),
  markAttendance: (id, user_id, attended) =>
    request(`/api/events/${id}/attendance`, { method: "POST", body: JSON.stringify({ user_id, attended }) }),

  studentDashboard: () => request("/api/dashboard/student"),
  organizerDashboard: () => request("/api/dashboard/organizer"),
  adminDashboard: () => request("/api/dashboard/admin"),
  getReports: () => request("/api/admin/reports"),
  adminListUsers: () => request("/api/admin/users"),
  approveOrganizer: (id) => request(`/api/admin/users/${id}/approve`, { method: "POST" }),
  

  rejectOrganizer: (id, reason) =>
  request(`/api/admin/users/${id}/reject`, {
    method: "POST",
    body: JSON.stringify({ reason }),
  }),
  // rejectOrganizer: (id) => request(`/admin/users/${id}/reject`, { method: "POST" }),
  // verifyId: (id) =>
  // request(`/admin/users/${id}/verify-id`, {
  //   method: "POST",
  // }),
  scanAttendance: (eventId, registrationId) =>
  request(`/api/events/${eventId}/attendance`, {
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
    request(`/api/admin/users/${id}`, {
        method: "DELETE",
        body: JSON.stringify({ reason }),
    }),
  // deleteUser: (id) => request(`/admin/users/${id}`, { method: "DELETE" }),
  // adminDeleteEvent: (id) => request(`/api/admin/events/${id}`, { method: "DELETE" }),
  adminDeleteEvent: (id, reason) =>
  request(`/api/admin/events/${id}`, {
    method: "DELETE",
    body: JSON.stringify({
      reason,
    }),
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
registrationQr : (registrationId) =>
  `${API_BASE}/api/registrations/${registrationId}/qr`,
};

export { getToken, getUser };

