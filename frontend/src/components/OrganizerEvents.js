import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../context/AuthContext";
import "./index.css";
import ConfirmationModal from "./ConfirmationModal";
import TermsModal from "../components/TermsModal";
export default function OrganizerEvents() {
const { user } = useAuth();
const [events, setEvents] = useState([]);
const [stats, setStats] = useState(null);
const [deleteModalOpen, setDeleteModalOpen] = useState(false);
const [eventToDelete, setEventToDelete] = useState(null);
const [deleteLoading, setDeleteLoading] = useState(false);
const [deleteError, setDeleteError] = useState("");
const [completeModalOpen, setCompleteModalOpen] = useState(false);
const [eventToComplete, setEventToComplete] = useState(null);
const [completeLoading, setCompleteLoading] = useState(false);
const [completeError, setCompleteError] = useState("");
const [showTerms, setShowTerms] = useState(false);
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
    setEventToDelete(null);

    await load();
  } catch (err) {
    setDeleteError(err.message);
  } finally {
    setDeleteLoading(false);
  }
};

 const completeEvent = (id) => {
  setEventToComplete(id);
  setCompleteError("");
  setCompleteModalOpen(true);
};

const confirmCompleteEvent = async () => {
  setCompleteLoading(true);
  setCompleteError("");

  try {
    await api.completeEvent(eventToComplete);

    setCompleteModalOpen(false);
    setEventToComplete(null);

    await load();
  } catch (err) {
    setCompleteError(err.message);
  } finally {
    setCompleteLoading(false);
  }
};

   const canEditEvent = (event) => {
   const eventDate = new Date(event.date_time);
   const lockDate = new Date(eventDate);
   lockDate.setDate(lockDate.getDate() - 7);
   return new Date() < lockDate; };

   const canCompleteEvent = (event) => {
  return new Date() >= new Date(event.date_time);
};
  
  return (
    <div className="container">
      <div className="dashboard-header">
        <h1>My Created Events</h1>
        <div
  style={{
    display: "flex",
    justifyContent: "flex-end",
    marginBottom: "15px",
  }}
>
  <button
    className="status-pill"
    onClick={() => setShowTerms(true)}
  >
    📘 Organizer Rules
  </button>
</div>
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
      {canEditEvent(e) ? (
  <Link to={`/organizer/events/${e._id}/edit`}>
    Edit
  </Link>
) : (
  <span
    className="link-btn disabled"
    title="Events cannot be edited within 7 days of the event."
  >
    Edit
  </span>
)}

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
    disabled={!canCompleteEvent(e)}
    title={
      !canCompleteEvent(e)
        ? "You can mark the event as completed only after it has finished."
        : ""
    }
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

 {!canEditEvent(e) ? (
  <button
    className="link-btn danger"
    disabled
    title="Events cannot be deleted within 7 days of the event."
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
            
            setEventToDelete(null);
          }}
          onConfirm={confirmDelete}
        />
      )}
{completeModalOpen && (
  <ConfirmationModal
    title="Mark Event as Completed"
    message="Are you sure you want to mark this event as completed?"
    bodyList={[
      "Attendance can no longer be modified.",
      "Students will be able to submit ratings.",
      "This action cannot be undone."
    ]}
    confirmText="Mark Completed"
    cancelText="Cancel"
    loading={completeLoading}
    error={completeError}
    onCancel={() => {
      setCompleteModalOpen(false);
      setEventToComplete(null);
      setCompleteError("");
    }}
    onConfirm={confirmCompleteEvent}
  />
)}

{showTerms && (
  <TermsModal
    role="organizer"
    readOnly
    onClose={() => setShowTerms(false)}
  />
)}
    </div>
  );
}
