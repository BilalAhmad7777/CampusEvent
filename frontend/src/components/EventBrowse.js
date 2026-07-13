import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import { api } from "../api";
import "./index.css";
import ConfirmationModal from "./ConfirmationModal";

import { COLLEGES } from "./colleges";

export default function EventBrowse() {
  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState({ search: "", category: "", venue: "", status: "" , college: ""});
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
const [eventToDelete, setEventToDelete] = useState(null);
const [deleteLoading, setDeleteLoading] = useState(false);
const [deleteError, setDeleteError] = useState("");


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



  const confirmDelete = async (reason) => {
  if (!reason.trim()) {
    setDeleteError("Cancellation reason is required.");
    return;
  }

  setDeleteLoading(true);
  setDeleteError("");

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
      <h1>Upcoming Campus Events</h1>

      <form className="filter-bar" onSubmit={handleFilterSubmit}>
        <input
          type="text"
          placeholder="Search by title..."
          value={filters.search}
          onChange={(e) => {
  setFilters({
    ...filters,
    search: e.target.value,
  });

  if (e.target.value !== "Other") {
    setOtherCollege("");
  }
}}
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

  {COLLEGES.map((college) => (
    <option key={college} value={college}>
      {college}
    </option>
  ))}
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
   onClick={(event) => {
  event.stopPropagation();
  event.preventDefault();

  setEventToDelete(e._id);
  setDeleteError("");
  setDeleteModalOpen(true);
}}
  >
    🗑 Delete Event
  </button>
)}  </div>
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
      setEventToDelete(null);
      setDeleteError("");
    }}
    onConfirm={confirmDelete}
  />
)}
    </div>
  );
}
