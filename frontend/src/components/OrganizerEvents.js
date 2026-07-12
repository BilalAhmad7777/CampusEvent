import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../context/AuthContext";
import "./index.css";
import ConfirmationModal from "./ConfirmationModal";

export default function OrganizerEvents() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [stats, setStats] = useState(null);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const load = async () => {

    const [ev, s] = await Promise.all([
      api.getEvents({ organizer_id: user._id }),
      api.organizerDashboard(),
    ]);
    setEvents(ev);
    setStats(s);
  };

  useEffect(() => { load(); }, []);

const handleDelete = (id) => {
  setEventToDelete(id);
  
  setDeleteError("");
  setDeleteModalOpen(true);
};
const confirmDelete = async (reason) => {
  if (!reason.trim()) {
    setDeleteError("Cancellation reason is required.");
    return;
  }

  setDeleteLoading(true);
  setDeleteError("");

  try {
    await api.deleteEvent(eventToDelete, reason.trim());

    setDeleteModalOpen(false);
    // setDeleteReason("");
    setEventToDelete(null);

    await load();
  } catch (err) {
    setDeleteError(err.message);
  } finally {
    setDeleteLoading(false);
  }
};

//   const completeEvent = async (id) => {
//   if (!window.confirm("Mark this event as completed?")) return;

//   await api.completeEvent(id);
//   load();
// };

 const completeEvent = async (id) => {
  if (!window.confirm("Mark this event as completed?")) return;

  await api.completeEvent(id);
  load();
};

  return (
    <div className="container">
      <div className="dashboard-header">
        <h1>My Created Events</h1>
        <Link to="/organizer/events/new"><button>+ New Event</button></Link>
      </div>

      {stats && (
        <section className="stat-bar">
          <div className="stat">{stats.total_events} events</div>
          <div className="stat">{stats.upcoming_events} upcoming</div>
          <div className="stat">{stats.total_participants} total participants</div>
          {stats.most_popular_event && (
            <div className="stat">Most popular: {stats.most_popular_event.title}</div>
          )}
        </section>
      )}

      {events.length === 0 ? (
        <p className="empty">You haven't created any events yet.</p>
      ) : (
        <div className="event-grid">
          {events.map((e) => (
            <div className="event-card" key={e._id}>
              <div className={`status-badge status-${e.status}`}>{e.status}</div>
              <h3>{e.title}</h3>
              <p className="event-meta">{e.category} · {e.venue}</p>
              <p className="event-meta">{new Date(e.date_time).toLocaleString()}</p>
              <p className="event-meta">{e.registered_count}/{e.max_participants} registered</p>
              <div className="card-actions">

  {e.status !== "completed" && (
    <>
      <Link to={`/organizer/events/${e._id}/edit`}>
        Edit
      </Link>

      <Link to={`/organizer/events/${e._id}/registrations`}>
        Registrations
      </Link>

      <Link to={`/scanner?event=${e._id}`}>
        📷 Scan Attendance
      </Link>
    </>
  )}

  {e.status === "closed" && (
    <button
      className="link-btn"
      onClick={() => completeEvent(e._id)}
    >
      Mark Completed
    </button>
  )}

  {e.status === "completed" && (
    <span
      style={{
        color: "#16a34a",
        fontWeight: 600,
      }}
    >
      ✓ Completed
    </span>
  )}

 {e.status === "completed" ? (
  <button
    className="link-btn danger"
    disabled
    title="Completed events cannot be deleted"
  >
    Delete
  </button>
) : (
  <button
    className="link-btn danger"
    onClick={() => handleDelete(e._id)}
  >
    Delete
  </button>
)}

</div>
            </div>
          ))}
        </div>
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
            setDeleteError("");
            // setDeleteReason("");
            setEventToDelete(null);
          }}
          onConfirm={confirmDelete}
        />
      )}

    </div>
  );
}
