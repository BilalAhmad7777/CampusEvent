import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../context/AuthContext";
import "./index.css";
import ConfirmationModal from "./ConfirmationModal";

export default function EventDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [myRegs, setMyRegs] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
const [cancelLoading, setCancelLoading] = useState(false);
const [cancelError, setCancelError] = useState("");
const [showReportModal, setShowReportModal] = useState(false);
const [reportReason, setReportReason] = useState("");
const [reportDescription, setReportDescription] = useState("");
const [reportLoading, setReportLoading] = useState(false);
const [reportError, setReportError] = useState("");

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
      
 if (res.status === "waitlisted") {
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

 const confirmCancel = async () => {
  setCancelLoading(true);
  setCancelError("");

  setError("");
  setMessage("");

  try {
    await api.cancelRegistration(id);

    setCancelModalOpen(false);

    setMessage("Registration cancelled.");

    await load();
  } catch (err) {
    setCancelError(err.message);
  } finally {
    setCancelLoading(false);
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


const eligible =
  !event.allowed_colleges?.length ||
  event.allowed_colleges.includes(user?.college);



  const submitReport = async ({ reason, description }) => {
  setReportLoading(true);
  setReportError("");

  try {
    await api.report({
      target_type: "event",
      target_id: event._id,
      reason,
      description,
    });

    setShowReportModal(false);
    setReportReason("");
    setReportDescription("");

    alert("Report submitted successfully.");
  } catch (err) {
    setReportError(err.message);
  } finally {
    setReportLoading(false);
  }
};



  return (
    <div className="container narrow">
      <div className={`status-badge status-${event.status}`}>{event.status}</div>
      <h1>{event.title}</h1>
<p className="event-meta">
  {event.category} · {event.venue}
</p>

{event.allowed_colleges?.length > 0 && (
  <p className="event-meta">
    <strong>Eligible Colleges:</strong>{" "}
    {event.allowed_colleges.join(", ")}
  </p>
)}      <p className="event-meta">{new Date(event.date_time).toLocaleString()}</p>
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
  onClick={() => {
    setCancelError("");
    setCancelModalOpen(true);
  }}
>
  Cancel Registration
</button>
)}
            {/* <button className="danger-btn" onClick={handleCancel}>Cancel registration</button> */}
                  </div>
        ) : eligible ? (
          <button
            onClick={handleRegister}
            disabled={event.status !== "open"}
          >
            {event.status === "open"
              ? "Register"
              : "Registration Closed"}
          </button>
        ) : (
          <button
            disabled
            title="You are not eligible for this event."
          >
            Not Eligible
          </button>

          
        )
        
      )
      }
      <button
  className="link-btn danger"
  onClick={() => {
    setReportError("");
    setShowReportModal(true);
  }}
>
  🚩 Report Event
</button>

      {user &&
  user.role === "student" &&
  myReg &&
  myReg.attended &&
  event.status === "completed" && (
    <div className="card">
      <h2>Rate this Event</h2>

      <h3>Your Rating</h3>

<div className="rating-stars">
  {[1, 2, 3, 4, 5].map((star) => (
  <span
    key={star}
    onClick={() => setRating(star)}
    onMouseEnter={() => setHoverRating(star)}
    onMouseLeave={() => setHoverRating(0)}
    className={`rating-star ${star <= (hoverRating || rating) ? "is-filled" : ""}`}
  >
    ★
  </span>
))}
</div>

<p className="rating-caption">
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
  style={{ width: "100%", marginBottom: "15px" }}
/>

<button onClick={handleRating} style={{ width: "100%" }}>
  Submit Feedback
</button>
    </div>
)}
      {!user && <button onClick={() => navigate("/")}>Log in to register</button>}
    
     {cancelModalOpen && (
        <ConfirmationModal
          title="Cancel Registration"
          message="Are you sure you want to cancel your registration?"
          bodyList={[
            "Your registration will be removed.",
            "If you had a confirmed seat, the next waitlisted student may be be promoted.",
            "This action cannot be undone."
          ]}
          confirmText="Cancel Registration"
          cancelText="Keep Registration"
          danger
          loading={cancelLoading}
          error={cancelError}
          onCancel={() => {
            setCancelModalOpen(false);
            setCancelError("");
          }}
          onConfirm={confirmCancel}
        />
      )}

      {showReportModal && (
  <ConfirmationModal
    title="Report Event"
    message="Help us keep the platform safe by reporting inappropriate events."
    bodyList={[
      "False reports may lead to action against your account.",
      "Our admin team will review your report.",
    ]}
    selectLabel="Reason"
    selectOptions={[
      "Spam",
      "Fake Event",
      "Inappropriate Content",
      "Harassment",
      "Wrong Information",
      "Other",
    ]}
    selectValue={reportReason}
    onSelectChange={setReportReason}
    inputLabel="Description (Optional)"
    inputPlaceholder="Tell us more..."
    inputValue={reportDescription}
    onInputChange={setReportDescription}
    confirmText="Submit Report"
    cancelText="Cancel"
    danger
    loading={reportLoading}
    error={reportError}
    onCancel={() => {
      setShowReportModal(false);
      setReportReason("");
      setReportDescription("");
      setReportError("");
    }}
    onConfirm={submitReport}
  />
)}


    </div>
  );
}