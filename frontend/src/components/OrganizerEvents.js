import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../context/AuthContext";
import ConfirmationModal from "./ConfirmationModal.js";
import "./index.css";



export default function OrganizerEvents() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [stats, setStats] = useState(null);

  // modal: { type: "delete" | "complete", event }
  const [modal, setModal] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState("");

  const load = async () => {
    const [ev, s] = await Promise.all([
      api.getEvents({ organizer_id: user._id }),
      api.organizerDashboard(),
    ]);
    setEvents(ev);
    setStats(s);
  };

  useEffect(() => { load(); }, []);

  const closeModal = () => {
    if (modalLoading) return;
    setModal(null);
    setModalError("");
  };

  const handleDeleteConfirm = async (reason) => {
    setModalError("");
    setModalLoading(true);
    try {
      await api.deleteEvent(modal.event._id, reason);
      setModal(null);
      await load();
    } catch (err) {
      setModalError(err.message);
    } finally {
      setModalLoading(false);
    }
  };

  const handleCompleteConfirm = async () => {
    setModalError("");
    setModalLoading(true);
    try {
      await api.completeEvent(modal.event._id);
      setModal(null);
      await load();
    } catch (err) {
      setModalError(err.message);
    } finally {
      setModalLoading(false);
    }
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
      onClick={() => setModal({ type: "complete", event: e })}
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
    onClick={() => setModal({ type: "delete", event: e })}
  >
    Delete
  </button>
)}

</div>
            </div>
          ))}
        </div>
      )}

      {modal?.type === "delete" && (
        <ConfirmationModal
          title="Delete Event"
          message={`"${modal.event.title}" will be permanently deleted. This cannot be undone.`}
          inputLabel="Cancellation reason"
          inputPlaceholder="Let registered students know why this event is being cancelled..."
          inputRequired
          confirmText="Delete Event"
          cancelText="Cancel"
          danger
          loading={modalLoading}
          error={modalError}
          onConfirm={handleDeleteConfirm}
          onCancel={closeModal}
        />
      )}

      {modal?.type === "complete" && (
        <ConfirmationModal
          title="Complete Event"
          message="This action cannot be undone. Once completed:"
          bodyList={[
            "Attendance can no longer be edited.",
            "Registrations will close permanently.",
            "The event can no longer be deleted.",
          ]}
          confirmText="Complete Event"
          cancelText="Cancel"
          loading={modalLoading}
          error={modalError}
          onConfirm={handleCompleteConfirm}
          onCancel={closeModal}
        />
      )}
    </div>
  );
}