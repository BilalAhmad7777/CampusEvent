import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import { api } from "../api";
import "./index.css";

export default function EventBrowse() {
  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState({ search: "", category: "", venue: "", status: "" , college: ""});
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const load = async () => {
    setLoading(true);
    const [ev, cats] = await Promise.all([api.getEvents(filters), api.getCategories()]);
    setEvents(ev);
    setCategories(cats);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    load();
  };

  return (
    <div className="container">
      <h1>Upcoming Campus Events</h1>

      <form className="filter-bar" onSubmit={handleFilterSubmit}>
        <input
          type="text"
          placeholder="Search by title..."
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
        />
        <select value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value })}>
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

         <select
  value={filters.college}
  onChange={(e) =>
    setFilters({
      ...filters,
      college: e.target.value,
    })
  }
>
  <option value="">All Colleges</option>

  <option>GCET Greater Noida</option>
  <option>AKGEC</option>
  <option>GL Bajaj</option>
  <option>KIET</option>
  <option>NIET</option>
  <option>Galgotias University</option>
  <option>Bennett University</option>
</select>


        <input
          type="text"
          placeholder="Venue"
          value={filters.venue}
          onChange={(e) => setFilters({ ...filters, venue: e.target.value })}
        />
        <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
          <option value="">Any status</option>
          <option value="open">Open</option>
          <option value="closed">Closed</option>
        </select>
        <button type="submit">Search</button>
      </form>

      {loading ? (
        <p className="empty">Loading events...</p>
      ) : events.length === 0 ? (
        <p className="empty">No events match your filters.</p>
      ) : (
        <div className="event-grid">
          {events.map((e) => (
            <div key={e._id} className="event-card">
              <Link
  to={`/events/${e._id}`}
  style={{
    color: "inherit",
    textDecoration: "none",
    display: "block",
  }}
>
  {e.poster_url && (
    <img
      src={e.poster_url}
      alt={e.title}
      style={{
        width: "100%",
        height: "180px",
        objectFit: "cover",
        borderRadius: "10px",
        marginBottom: "10px",
      }}
    />
  )}

  <div className={`status-badge status-${e.status}`}>
    {e.status}
  </div>

  <h3>{e.title}</h3>

  <p className="event-meta">
  {e.category} · {e.college}
</p>

<p className="event-meta">
  📍 {e.venue}
</p>

  <p className="event-meta">
    {new Date(e.date_time).toLocaleString()}
  </p>

  <p className="event-meta">
    {e.registered_count}/{e.max_participants} registered
  </p>
</Link>
          {user?.role === "admin" && (
  <button
    className="danger-btn"
    style={{
      marginTop: "12px",
      width: "100%",
    }}
   onClick={async (event) => {
  event.stopPropagation();
  event.preventDefault();

  if (!window.confirm(`Delete "${e.title}" permanently?`)) return;

  try {
    await api.adminDeleteEvent(e._id);
    await load();
    alert("Event deleted successfully.");
  } catch (err) {
    alert(err.message);
  }
}}
  >
    🗑 Delete Event
  </button>
)}  </div>
          ))}
        </div>
      )}
    </div>
  );
}
