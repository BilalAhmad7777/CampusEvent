import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../api";
import "./index.css";
import ConfirmationModal from "./ConfirmationModal";
import ImageModal from "./ImageModal";


export default function EventRegistrations() {
const { id } = useParams();
const [event, setEvent] = useState(null);
const [regs, setRegs] = useState([]);
const [rejectModalOpen, setRejectModalOpen] = useState(false);
const [registrationToReject, setRegistrationToReject] = useState(null);
const [rejectLoading, setRejectLoading] = useState(false);
const [rejectError, setRejectError] = useState("");
const [idCardModalOpen, setIdCardModalOpen] = useState(false);
const [selectedIdCard, setSelectedIdCard] = useState("");

  const load = async () => {
    const [ev, r] = await Promise.all([api.getEvent(id), api.eventRegistrations(id)]);
    setEvent(ev);
    setRegs(r);
  };

  useEffect(() => { load(); }, [id]);

  const toggleAttendance = async (userId, current) => {
    await api.markAttendance(id, userId, !current);
    load();
  };

  const approveStudent = async (registrationId) => {
  try {
    await api.approveRegistration(id, registrationId);
    load();
  } catch (err) {
    alert(err.message);
  }
};

const rejectStudent = (registrationId) => {
  setRegistrationToReject(registrationId);
  setRejectError("");
  setRejectModalOpen(true);
};

const confirmReject = async (reason) => {
  if (!reason.trim()) {
    setRejectError("Reason is required.");
    return;
  }

  setRejectLoading(true);
  setRejectError("");

  try {
    await api.rejectRegistration(
      id,
      registrationToReject,
      reason.trim()
    );

    setRejectModalOpen(false);
    setRegistrationToReject(null);

    await load();
  } catch (err) {
    setRejectError(err.message);
  } finally {
    setRejectLoading(false);
  }
};

  const downloadCSV = () => {
  const rows = [
    [
      "Registration ID",
      "Name",
      "Email",
      "Status",
      "Attended",
      "Registered At",
    ],
  ];

  regs.forEach((r) => {
    rows.push([
      r.registration_id,
      r.student_name,
      r.student_email,
      r.status,
      r.attended ? "Yes" : "No",
      new Date(r.registered_at).toLocaleString(),
    ]);
  });

  const csvContent = rows
    .map((row) => row.join(","))
    .join("\n");

  const blob = new Blob([csvContent], {
    type: "text/csv;charset=utf-8;",
  });

  const link = document.createElement("a");

  link.href = URL.createObjectURL(blob);

  link.download = `${event.title.replace(/\s+/g, "_")}_Participants.csv`;

  link.click();
};

  if (!event) return <div className="container"><p className="empty">Loading...</p></div>;

  const pending = regs.filter(
  (r) => r.status === "pending_verification"
);

const confirmed = regs.filter(
  (r) => r.status === "registered"
);

const waitlisted = regs.filter(
  (r) => r.status === "waitlisted"
);

  return (
    <div className="container">
      <Link to="/organizer/events">← Back to my events</Link>
      <h1>{event.title} — Registrations</h1>
      <button onClick={downloadCSV}>
  📥 Download Participants CSV
</button>
      

      <section className="card">
  <h2>Pending Verification ({pending.length})</h2>

  {pending.length === 0 ? (
    <p className="empty">No pending requests.</p>
  ) : (
    <ul className="subject-list">
      {pending.map((r) => (
        <li key={r._id} className="subject-item">
          <div>
  <strong>{r.student_name}</strong>

  <br />


  <br />

  <small>
    {r.college}
  </small>

  <br />

  <small>
    Roll No: {r.roll_number}
  </small>
</div>

          <div
            style={{
              display: "flex",
              gap: "10px",
            }}
          >
           <button
  onClick={() => {
    setSelectedIdCard(r.college_id);
    setIdCardModalOpen(true);
  }}
>
  🪪 View College ID
</button>

            <button
  onClick={() => approveStudent(r._id)}
>
  ✅ Approve
</button>

            <button
  className="danger-btn"
  onClick={() => rejectStudent(r._id)}
>
  ❌ Reject
</button>
          </div>
        </li>
      ))}
    </ul>
  )}
</section>


      <section className="card">
        <h2>Confirmed ({confirmed.length}/{event.max_participants})</h2>
        {confirmed.length === 0 ? (
          <p className="empty">No confirmed registrations yet.</p>
        ) : (
          <ul className="subject-list">
            {confirmed.map((r) => (
              <li key={r._id} className="subject-item">
                <span className="subject-name">{r.student_name} ({r.student_college})</span>
                <span
       className={`status-pill ${
          r.attended ? "status-approved" : "status-pending"
       }`}
           >
        {r.attended ? "Attended ✓" : "Not Attended"}
        </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {waitlisted.length > 0 && (
        <section className="card">
          <h2>Waitlist ({waitlisted.length})</h2>
          <ul className="subject-list">
            {waitlisted.map((r) => (
              <li key={r._id} className="subject-item">
                <span className="subject-name">{r.student_name} ({r.student_college})</span>
                <span className="status-pill">waitlisted</span>
              </li>
            ))}
          </ul>
        </section>
      )
      }
      {rejectModalOpen && (
  <ConfirmationModal
    title="Reject Registration"
    message="Are you sure you want to reject this student's registration?"
    bodyList={[
      "The student will receive an email explaining the reason.",
      "The student can register again later if eligible.",
    ]}
    inputLabel="Reason for rejection"
    inputPlaceholder="Enter the reason..."
    inputRequired
    confirmText="Reject Student"
    cancelText="Cancel"
    danger
    loading={rejectLoading}
    error={rejectError}
    onCancel={() => {
      setRejectModalOpen(false);
      setRegistrationToReject(null);
      setRejectError("");
    }}
    onConfirm={confirmReject}
  />
)}

{idCardModalOpen && (
  <ImageModal
    title="College ID Card"
    image={selectedIdCard}
    onClose={() => {
      setIdCardModalOpen(false);
      setSelectedIdCard("");
    }}
  />
)}
    </div>
  );
}
