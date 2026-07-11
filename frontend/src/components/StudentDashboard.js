import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import "./index.css";

export default function StudentDashboard() {
  const [stats, setStats] = useState(null);
  const [regs, setRegs] = useState([]);
  const [history, setHistory] = useState([]);

  const load = async () => {
    const [s, r, h] = await Promise.all([api.studentDashboard(), api.myRegistrations(), api.myHistory()]);
    setStats(s);
    setRegs(r);
    setHistory(h);
  };

  useEffect(() => { load(); }, []);

  const handleCancel = async (eventId) => {
    await api.cancelRegistration(eventId);
    load();
  };

  return (
    <div className="container">
      <h1>My Events</h1>

      {stats && (
        <section className="stat-bar">
          <div className="stat">{stats.registered_count} registered</div>
          <div className="stat">{stats.waitlisted_count} waitlisted</div>
          <div className="stat">{stats.attended_count} attended</div>
        </section>
      )}

      <section className="card">
        <h2>Upcoming Registrations</h2>
        {regs.length === 0 ? (
          <p className="empty">You haven't registered for anything yet.</p>
        ) : (
          <ul className="subject-list">
            {regs.map((r) => (
              <li key={r._id} className="subject-item">
                <Link to={`/events/${r.event._id}`} className="subject-name">{r.event.title}</Link>
                <span className={`status-pill status-${r.status}`}>{r.status}</span>
                <div
  style={{
    display: "flex",
    gap: "10px",
  }}
>
  <Link
    to={`/ticket/${r.registration_id}`}
    className="status-pill"
    style={{
      textDecoration: "none",
    }}
  >
    🎫 Ticket
  </Link>
  <a
  href={`/ticket/${r.registration_id}?download=true`}
  target="_blank"
  rel="noreferrer"
  className="link-btn"
>
  📄 Download PDF
</a>

  {r.attended ? (
  <span
    style={{
      color: "#16a34a",
      fontWeight: "600",
    }}
  >
    ✓ Attended
  </span>
) : (
  <button
    className="delete-btn"
    onClick={() => handleCancel(r.event._id)}
  >
    Cancel
  </button>
)}
</div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="card">
        <h2>Attendance History</h2>
        {history.length === 0 ? (
          <p className="empty">No attended events yet.</p>
        ) : (
          <ul className="subject-list">
            {history.map((h) => (
              <li key={h._id} className="subject-item">
                <Link to={`/events/${h.event._id}`} className="subject-name">{h.event.title}</Link>
                <span className="status-pill status-revised">attended</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
