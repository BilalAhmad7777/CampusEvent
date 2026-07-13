import React, { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { api } from "../api";
import "./index.css";
import ConfirmationModal from "./ConfirmationModal";

export default function AdminPanel() {
const [stats, setStats] = useState(null);
const [users, setUsers] = useState([]);
const [events, setEvents] = useState([]);
const [selectedId, setSelectedId] = useState(null);
const [selectedUser, setSelectedUser] = useState(null);
const [rejectModalOpen, setRejectModalOpen] = useState(false);
const [rejectLoading, setRejectLoading] = useState(false);
const [rejectError, setRejectError] = useState("");
const [deleteUserModalOpen, setDeleteUserModalOpen] = useState(false);
const [userToDelete, setUserToDelete] = useState(null);
const [deleteUserLoading, setDeleteUserLoading] = useState(false);
const [deleteUserError, setDeleteUserError] = useState("");
const [deleteModalOpen, setDeleteModalOpen] = useState(false);
const [eventToDelete, setEventToDelete] = useState(null);
const [deleteLoading, setDeleteLoading] = useState(false);
const [deleteError, setDeleteError] = useState("");
const [reports, setReports] = useState([]);


  const load = async () => {
    const [s, u, e,r] = await Promise.all([
  api.adminDashboard(),
  api.adminListUsers(),
  api.getEvents(),
  api.getReports(),
]);
setStats(s);
setUsers(u);
setEvents(e);
setReports(r);
  };

  useEffect(() => { load(); }, []);

  const handleDeleteUser = (id) => {
    setUserToDelete(id);
    setDeleteUserError("");
    setDeleteUserModalOpen(true);
};


const confirmDeleteUser = async (reason) => {
    if (!reason.trim()) {
        setDeleteUserError("Reason is required.");
        return;
    }

    setDeleteUserLoading(true);
    setDeleteUserError("");

    try {
        await api.deleteUser(userToDelete, reason.trim());

        setDeleteUserModalOpen(false);
        setUserToDelete(null);

        await load();
    } catch (err) {
        setDeleteUserError(err.message);
    } finally {
        setDeleteUserLoading(false);
    }
};



const confirmRejectOrganizer = async (reason) => {
  if (!reason.trim()) {
    setRejectError("Reason is required.");
    return;
  }

  setRejectLoading(true);
  setRejectError("");

  try {
    await api.rejectOrganizer(
      selectedUser._id,
      reason.trim()
    );

    setRejectModalOpen(false);
    setSelectedId(null);
    setSelectedUser(null);

    await load();
  } catch (err) {
    setRejectError(err.message);
  } finally {
    setRejectLoading(false);
  }
};

const confirmDelete = async (reason) => {
  if (!reason.trim()) {
    setDeleteError("Cancellation reason is required.");
    return;
  }

  setDeleteLoading(true);

  try {
    await api.adminDeleteEvent(
      eventToDelete,
      reason.trim()
    );

    setDeleteModalOpen(false);
    setEventToDelete(null);

    await load();
  } catch (err) {
    setDeleteError(err.message);
  } finally {
    setDeleteLoading(false);
  }
};




  return (
    <div className="container">
      <h1>Admin Panel</h1>

      {stats && (
        <>
          <section className="stat-bar">
            <div className="stat">{stats.total_users} Total Users</div>

<div className="stat">{stats.total_students} Students</div>

<div className="stat">{stats.total_organizers} Organizers</div>

<div className="stat">{stats.total_admins} Admins</div>

<div className="stat">{stats.total_events} Events</div>

<div className="stat">{stats.total_registrations} Registrations</div>
          </section>

          <div className="two-col">
            <section className="card">
              <h2>Registrations by Category</h2>
              {stats.by_category.length === 0 ? (
                <p className="empty">No data yet.</p>
              ) : (
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={stats.by_category}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#4f46e5" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </section>

            <section className="card">
              <h2>Registrations by Month</h2>
              {stats.by_month.length === 0 ? (
                <p className="empty">No data yet.</p>
              ) : (
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={stats.by_month}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#7c3aed" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </section>
          </div>
        </>
      )}


<section className="card">
  <h2>All Events</h2>

  {events.length === 0 ? (
    <p className="empty">No events found.</p>
  ) : (
    <ul className="subject-list">
      {events.map((event) => (
        <li key={event._id} className="subject-item spread">
          <div>
            <strong>{event.title}</strong>
            <br />
            <small>{event.category}</small>
            <br />
            <small>{event.date}</small>
          </div>

          

          <button
  className="delete-btn"
  onClick={() => {
    setEventToDelete(event._id);
    setDeleteError("");
    setDeleteModalOpen(true);
  }}
>
  Delete
</button>



        </li>
      ))}
    </ul>
  )}
</section>



<section className="card">
  <h2>🚩 Reports</h2>

  {reports.length === 0 ? (
    <p className="empty">No reports found.</p>
  ) : (
    <ul className="subject-list">
      {reports.map((report) => (
        <li key={report._id} className="subject-item spread">
  <div>
    <strong>🚩 {report.reason}</strong>

    <br />

    <small>
      <strong>Event:</strong> {report.target_name}
    </small>

    <br />

    <small>
      <strong>Reported By:</strong> {report.reporter_name}
    </small>

    <br />

    <small>
      <strong>Status:</strong> {report.status}
    </small>

    <br />

    <small>
      <strong>Description:</strong><br />
      {report.description || "No description"}
    </small>
  </div>

  {report.status === "pending" && (
    <button
      className="status-pill"
      onClick={async () => {
        await api.resolveReport(report._id);
        load();
      }}
    >
      ✅ Resolve
    </button>
  )}
</li>
      ))}
    </ul>
  )}
</section>



    <section className="card">
  <h2>All Users</h2>

  {users.length === 0 ? (
    <p className="empty">No users found.</p>
  ) : (
    <ul className="subject-list">
      {users.map((u) => (
        <li key={u._id} className="subject-item spread">
          {/* Profile Photo */}
          <img
            src={
              u.profile_photo ||
              "https://via.placeholder.com/60?text=User"
            }
            alt={u.name}
            className="admin-row-avatar"
          />

          {/* User Details */}
          <div style={{ flex: 1 }}>
            <strong>{u.name}</strong>
            <br />
            <small>{u.email}</small>
            <br />
            <small>
  {u.role === "student" && "🎓 Student"}

  {u.role === "organizer" &&
    (u.approved
      ? "🧑‍🏫 Organizer (Approved)"
      : "🟡 Organizer (Pending)")}

  {u.role === "admin" && "👑 Admin"}
</small>

            <br />

            
          </div>

          {/* College ID */}
          {u.college_id ? (
            <button
  className="status-pill"
  onClick={() => {
    setSelectedId(u.college_id);
    setSelectedUser(u);
  }}
>
  View College ID
</button>
          ) : (
            <span style={{ color: "#888" }}>
              No ID
            </span>
          )}

          {u.role !== "admin" && (
            <button
              className="delete-btn"
              onClick={() => handleDeleteUser(u._id)}
            >
              Delete
            </button>
          )}
        </li>
      ))}
    </ul>
  )}
</section>
{selectedId && (
  <div className="admin-modal-overlay">
    <div className="admin-modal-box">
      <h2>Student Details</h2>

      {selectedUser && (
        <>
          <div className="admin-modal-identity">
            <h3>{selectedUser.name}</h3>
            <p>📧 {selectedUser.email}</p>
            <p style={{ textTransform: "capitalize" }}>👤 {selectedUser.role}</p>
          </div>

          <div className="admin-modal-grid">
            <div>
              <h4>Profile Photo</h4>

              <div className="admin-modal-photo-wrap">
                <img
                  src={selectedUser.profile_photo}
                  alt={selectedUser.name}
                  className="admin-modal-photo"
                />
              </div>

              <p className="admin-modal-photo-name">{selectedUser.name}</p>
            </div>

            <div>
              <h4>College ID Card</h4>

              <img
                src={selectedId}
                alt="College ID"
                className="admin-modal-id-image"
              />

              <p className="admin-modal-id-caption">
                College ID uploaded by the student.
              </p>
            </div>
          </div>

          <div className="admin-modal-actions">
            {selectedUser.role === "organizer" &&
 !selectedUser.approved && (
  <>
    <button
      className="status-pill"
      onClick={async () => {
        await api.approveOrganizer(selectedUser._id);

        setSelectedId(null);
        setSelectedUser(null);

        load();
      }}
    >
      ✅ Approve Organizer
    </button>

    <button
  className="delete-btn"
  onClick={() => {
    setRejectError("");
    setRejectModalOpen(true);
  }}
>
      ❌ Reject Organizer
    </button>
  </>
)}

            <button
              className="link-btn"
              onClick={() => {
                setSelectedId(null);
                setSelectedUser(null);
              }}
            >
              Close
            </button>
          </div>
        </>
      )}
    </div>
  </div>
)}
{rejectModalOpen && (
  <ConfirmationModal
    title="Reject Organizer"
    message="Are you sure you want to reject this organizer?"
    bodyList={[
      "The organizer will receive an email with the rejection reason.",
      "They can register again later.",
    ]}
    inputLabel="Reason for rejection"
    inputPlaceholder="Enter the rejection reason..."
    inputRequired
    confirmText="Reject Organizer"
    cancelText="Cancel"
    danger
    loading={rejectLoading}
    error={rejectError}
    onCancel={() => {
      setRejectModalOpen(false);
      setRejectError("");
    }}
    onConfirm={confirmRejectOrganizer}
  />
)}

{deleteUserModalOpen && (
  <ConfirmationModal
    title="Delete User"
    message="Are you sure you want to permanently remove this user?"
    bodyList={[
      "This action cannot be undone.",
      "The user's account and related access will be removed.",
      "An email will be sent explaining the reason.",
    ]}
    inputLabel="Reason for removal"
    inputPlaceholder="Enter the reason..."
    inputRequired
    confirmText="Delete User"
    cancelText="Cancel"
    danger
    loading={deleteUserLoading}
    error={deleteUserError}
    onCancel={() => {
      setDeleteUserModalOpen(false);
      setUserToDelete(null);
      setDeleteUserError("");
    }}
    onConfirm={confirmDeleteUser}
  />
)}


{deleteModalOpen && (
  <ConfirmationModal
    title="Delete Event"
    message="Are you sure you want to delete this event?"
    bodyList={[
      "This action cannot be undone.",
      "All registrations will be removed.",
      "Registered students will receive a cancellation email.",
    ]}
    inputLabel="Reason for cancellation"
    inputPlaceholder="Enter the cancellation reason..."
    inputRequired
    confirmText="Delete Event"
    cancelText="Cancel"
    danger
    loading={deleteLoading}
    error={deleteError}
    onCancel={() => {
      setDeleteModalOpen(false);
      setEventToDelete(null);
      setDeleteError("");
    }}
    onConfirm={confirmDelete}
  />
)}

    </div>
  
  );
}