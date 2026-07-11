import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../api";
import "./index.css";


export default function EventRegistrations() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [regs, setRegs] = useState([]);

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

const rejectStudent = async (registrationId) => {
  const reason = prompt("Reason for rejection:");

  if (!reason) return;

  try {
    await api.rejectRegistration(
      id,
      registrationId,
      reason
    );

    load();
  } catch (err) {
    alert(err.message);
  }
};

  // const exportCsvText = () => {
  //   const rows = [["Name", "Email", "Status", "Attended"]];
  //   regs.forEach((r) => rows.push([r.student_name, r.student_email, r.status, r.attended ? "Yes" : "No"]));
  //   return rows.map((row) => row.join(",")).join("\n");
  // };

  // const handleCopyList = () => {
  //   navigator.clipboard.writeText(exportCsvText());
  //   alert("Participant list copied as CSV text — paste into a .csv file.");
  // };
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

  // const confirmed = regs.filter((r) => r.status === "registered");
  // const waitlisted = regs.filter((r) => r.status === "waitlisted");

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

  {/* {r.student_email} */}

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
  onClick={() =>
    window.open(r.college_id, "_blank")
  }
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
                <button className="status-pill" onClick={() => toggleAttendance(r.user_id, r.attended)}>
                  {r.attended ? "Attended ✓" : "Mark attended"}
                </button>
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
      )}
    </div>
  );
}
