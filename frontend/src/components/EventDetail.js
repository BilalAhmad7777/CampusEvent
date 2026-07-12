import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../context/AuthContext";
import "./index.css";

export default function EventDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [myRegs, setMyRegs] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
const [feedback, setFeedback] = useState("");

  const load = async () => {
    const ev = await api.getEvent(id);
    setEvent(ev);
    if (user && user.role === "student") {
      const regs = await api.myRegistrations();
      setMyRegs(regs);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  if (!event) return <div className="container"><p className="empty">Loading...</p></div>;

  const myReg = myRegs.find((r) => r.event._id === id);

  const handleRegister = async () => {
    setError(""); setMessage("");
    if (!user) return navigate("/");
    try {
      const res = await api.registerForEvent(id);
      // setMessage(res.status === "waitlisted" ? "Event is full — you've been added to the waitlist." : "You're registered!");
      if (res.status === "pending_verification") {
  setMessage(
    "🟡 Registration request submitted successfully! It is now awaiting organizer approval."
  );
} else if (res.status === "waitlisted") {
  setMessage(
    "🟠 Event is full. You've been added to the waitlist."
  );
} else if (res.status === "registered") {
  setMessage(
    "🟢 Registration confirmed! You can now download your QR ticket."
  );
}
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCancel = async () => {
    setError(""); setMessage("");
    try {
      await api.cancelRegistration(id);
      setMessage("Registration cancelled.");
      load();
    } catch (err) {
      setError(err.message);
    }
  };

   const handleRating = async () => {
  setError("");
  setMessage("");

  try {
    await api.rateEvent(id, {
      rating,
      feedback,
    });

    setMessage("Thank you for your feedback!");
    load();
  } catch (err) {
    setError(err.message);
  }
};

  return (
    <div className="container narrow">
      <div className={`status-badge status-${event.status}`}>{event.status}</div>
      <h1>{event.title}</h1>
      <p className="event-meta">{event.category} · {event.venue}</p>
      <p className="event-meta">{new Date(event.date_time).toLocaleString()}</p>
      <p className="event-meta">Registration deadline: {new Date(event.registration_deadline).toLocaleString()}</p>
      <p className="event-meta">{event.registered_count}/{event.max_participants} registered</p>
      <p className="event-meta">Organized by {event.organizer_name}</p>
      {event.rating_count > 0 && (
  <div className="card">
    <h3>⭐ {event.average_rating} / 5</h3>
    <p>
      Based on {event.rating_count} review
      {event.rating_count !== 1 ? "s" : ""}
    </p>
  </div>
)}
      <div className="card">
        <h2>Description</h2>
        <p>{event.description}</p>
      </div>

      {event.reviews?.length > 0 && (
  <div className="card">
    <h2>Student Feedback</h2>

    {event.reviews.map((review, index) => (
      <div
        key={index}
        style={{
          borderBottom: "1px solid #ddd",
          padding: "12px 0",
        }}
      >
        <strong>{review.name}</strong>

        <p>{"⭐".repeat(review.rating)}</p>

        {review.feedback && (
          <p>{review.feedback}</p>
        )}
      </div>
    ))}
  </div>
)}

      {error && <div className="error">{error}</div>}
      {message && <div className="info">{message}</div>}

      {user && user.role === "student" && (
        myReg ? (
          <div>
            <p className="info">
  {myReg.status === "pending_verification"
    ? "🟡 Your registration request has been submitted and is awaiting organizer approval."

    : myReg.status === "registered"
    ? "✅ Your registration has been approved. You can now download your QR ticket."

    : myReg.status === "waitlisted"
    ? "🟠 The event is full. You have been placed on the waitlist."

    : myReg.status === "rejected"
    ? `❌ Your registration was rejected.\nReason: ${
        myReg.rejection_reason || "No reason provided."
      }`

    : ""}
</p>
            {myReg.status !== "rejected" &&
 event.status === "open" &&
 !myReg.attended && (
  <button
    className="danger-btn"
    onClick={handleCancel}
  >
    Cancel Registration
  </button>
)}
            {/* <button className="danger-btn" onClick={handleCancel}>Cancel registration</button> */}
          </div>
        ) : (
          <button onClick={handleRegister} disabled={event.status !== "open"}>
            {event.status === "open" ? "Register" : "Registration closed"}
          </button>
        )
      )}

      {user &&
  user.role === "student" &&
  myReg &&
  myReg.attended &&
  event.status === "completed" && (
    <div className="card">
      <h2>Rate this Event</h2>

      <h3>Your Rating</h3>

<div
  style={{
    display: "flex",
    gap: "6px",
    marginBottom: "15px",
  }}
>
  {[1, 2, 3, 4, 5].map((star) => (
  <span
    key={star}
    onClick={() => setRating(star)}
    onMouseEnter={() => setHoverRating(star)}
    onMouseLeave={() => setHoverRating(0)}
    style={{
      fontSize: "36px",
      cursor: "pointer",
      color: star <= (hoverRating || rating) ? "#fbbf24" : "#d1d5db",
      transition: "0.15s ease",
      userSelect: "none",
    }}
  >
    ★
  </span>
))}
</div>

<p
  style={{
    marginTop: "-5px",
    marginBottom: "15px",
    color: "#666",
    fontWeight: "500",
  }}
>
  {[
    "",
    "Poor",
    "Fair",
    "Good",
    "Very Good",
    "Excellent",
  ][hoverRating || rating]}
</p>

     <textarea
  rows={5}
  placeholder="Tell others about your experience..."
  value={feedback}
  onChange={(e) => setFeedback(e.target.value)}
  style={{
    width: "100%",
    padding: "12px",
    borderRadius: "10px",
    resize: "vertical",
    marginTop: "10px",
    marginBottom: "15px",
  }}
/>

<button
  onClick={handleRating}
  style={{
    width: "100%",
  }}
>
  Submit Feedback
</button>
    </div>
)}
      {!user && <button onClick={() => navigate("/")}>Log in to register</button>}
    </div>
  );
}
