import React, { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { api } from "../api";
import "./index.css";

export default function AdminPanel() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [events, setEvents] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
const [selectedUser, setSelectedUser] = useState(null);

  const load = async () => {
    const [s, u, e] = await Promise.all([
  api.adminDashboard(),
  api.adminListUsers(),
  api.getEvents()
]);

setStats(s);
setUsers(u);
setEvents(e);
  };

  useEffect(() => { load(); }, []);

//   const pendingOrganizers = users.filter((u) => u.role === "organizer" && !u.approved);

//   const handleApprove = async (id) => { await api.approveOrganizer(id); load(); };
//   const handleReject = async (id) => {
//   const reason = window.prompt(
//     "Reason for rejecting this organizer?"
//   );

//   if (!reason) return;

//   await api.rejectOrganizer(id, reason);

//   load();
// };
  
  // const handleReject = async (id) => { await api.rejectOrganizer(id); load(); };
  const handleDeleteUser = async (id) => {
    if (!window.confirm("Delete this user permanently?")) return;

    const reason = window.prompt(
        "Reason for removing this user:"
    );

    if (!reason || !reason.trim()) {
        alert("Reason is required.");
        return;
    }

    await api.deleteUser(id, reason);

    load();
};

  return (
    <div className="container">
      <h1>Admin Panel</h1>

      {stats && (
        <>
          <section className="stat-bar">
            <div className="stat">{stats.total_users} Total Users</div>

<div className="stat">{stats.total_students} Students</div>

<div className="stat">{stats.total_organizers} Organizers</div>

<div className="stat">{stats.total_admins} Admins</div>

<div className="stat">{stats.total_events} Events</div>

<div className="stat">{stats.total_registrations} Registrations</div>
          </section>

          <div className="two-col">
            <section className="card">
              <h2>Registrations by Category</h2>
              {stats.by_category.length === 0 ? (
                <p className="empty">No data yet.</p>
              ) : (
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={stats.by_category}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#4f46e5" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </section>

            <section className="card">
              <h2>Registrations by Month</h2>
              {stats.by_month.length === 0 ? (
                <p className="empty">No data yet.</p>
              ) : (
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={stats.by_month}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#7c3aed" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </section>
          </div>
        </>
      )}

      {/* <section className="card">
        <h2>Pending Organizer Approvals ({pendingOrganizers.length})</h2>
        {pendingOrganizers.length === 0 ? (
          <p className="empty">No pending approvals.</p>
        ) : (
          <ul className="subject-list">
            {pendingOrganizers.map((u) => (
              <li key={u._id} className="subject-item">
                <span className="subject-name">{u.name} ({u.email})</span>
                <button className="status-pill" onClick={() => handleApprove(u._id)}>Approve</button>
                <button className="delete-btn" onClick={() => handleReject(u._id)}>Reject</button>
              </li>
            ))}
          </ul>
        )}
      </section> */}


<section className="card">
  <h2>All Events</h2>

  {events.length === 0 ? (
    <p className="empty">No events found.</p>
  ) : (
    <ul className="subject-list">
      {events.map((event) => (
        <li
          key={event._id}
          className="subject-item"
          style={{
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <strong>{event.title}</strong>
            <br />
            <small>{event.category}</small>
            <br />
            <small>{event.date}</small>
          </div>

          <button
            className="delete-btn"
            onClick={async () => {
              if (!window.confirm("Delete this event?")) return;

              await api.adminDeleteEvent(event._id);

              load();
            }}
          >
            Delete Event
          </button>
        </li>
      ))}
    </ul>
  )}
</section>



    <section className="card">
  <h2>All Users</h2>

  {users.length === 0 ? (
    <p className="empty">No users found.</p>
  ) : (
    <ul className="subject-list">
      {users.map((u) => (
        <li
          key={u._id}
          className="subject-item"
          style={{
            alignItems: "center",
            gap: "16px",
            padding: "15px 0",
          }}
        >
          {/* Profile Photo */}
          <img
            src={
              u.profile_photo ||
              "https://via.placeholder.com/60?text=User"
            }
            alt={u.name}
            style={{
              width: "60px",
              height: "60px",
              borderRadius: "50%",
              objectFit: "cover",
            }}
          />

          {/* User Details */}
          <div style={{ flex: 1 }}>
            <strong>{u.name}</strong>
            <br />
            <small>{u.email}</small>
            <br />
            <small>
  {u.role === "student" && "🎓 Student"}

  {u.role === "organizer" &&
    (u.approved
      ? "🧑‍🏫 Organizer (Approved)"
      : "🟡 Organizer (Pending)")}

  {u.role === "admin" && "👑 Admin"}
</small>

            <br />

            
          </div>

          {/* College ID */}
          {u.college_id ? (
            <button
  className="status-pill"
  onClick={() => {
    setSelectedId(u.college_id);
    setSelectedUser(u);
  }}
>
  View College ID
</button>
          ) : (
            <span style={{ color: "#888" }}>
              No ID
            </span>
          )}

          {/* Verify Button */}
          {/* {!u.id_verified && u.role !== "admin" && (
          //   <button
          //     className="status-pill"
          //     onClick={async () => {
          //       await api.verifyId(u._id);
          //       load();
          //     }}
          //   >
          //     Verify ID
          //   </button>
          // )} */}

          {/* Unverify Button
          {u.id_verified && u.role !== "admin" && (
            <button
              className="status-pill"
              style={{
                background: "#fee2e2",
                color: "#b91c1c",
              }}
              onClick={async () => {
                await api.unverifyId(u._id);
                load();
              }}
            >
              Unverify
            </button>
          )} */}

          {/* Delete */}
          {u.role !== "admin" && (
            <button
              className="delete-btn"
              onClick={() => handleDeleteUser(u._id)}
            >
              Delete
            </button>
          )}
        </li>
      ))}
    </ul>
  )}
</section>
{selectedId && (
  <div
    style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      background: "rgba(0,0,0,0.65)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 9999,
    }}
  >
    <div
      style={{
        background: "#fff",
        padding: "25px",
        borderRadius: "12px",
        width: "600px",
        maxWidth: "90%",
        textAlign: "center",
      }}
    >
      <h2
  style={{
    marginTop: 0,
    marginBottom: "20px",
    color: "#4f46e5",
  }}
>
  Student Details
</h2>

      {selectedUser && (
        <>
         
 
  <div style={{ textAlign: "left", marginBottom: "20px" }}>
  <h3 style={{ marginBottom: "5px" }}>{selectedUser.name}</h3>

  <p>📧 {selectedUser.email}</p>

  <p style={{ textTransform: "capitalize" }}>
    👤 {selectedUser.role}
  </p>

  
</div>

<div
  style={{
    display: "grid",
    gridTemplateColumns: "220px 1fr",
    gap: "30px",
    alignItems: "start",
    marginBottom: "25px",
  }}
>
  <div>
  <h4
    style={{
      textAlign: "center",
      marginBottom: "15px",
    }}
  >
    Profile Photo
  </h4>

  <div
    style={{
      display: "flex",
      justifyContent: "center",
    }}
  >
    <img
      src={selectedUser.profile_photo}
      alt={selectedUser.name}
      style={{
        width: "170px",
        height: "170px",
        borderRadius: "50%",
        objectFit: "cover",
        border: "5px solid #4f46e5",
        boxShadow: "0 4px 15px rgba(0,0,0,0.15)",
      }}
    />
  </div>

  <p
    style={{
      textAlign: "center",
      marginTop: "15px",
      fontWeight: "600",
      fontSize: "16px",
    }}
  >
    {selectedUser.name}
  </p>
</div>

<div>
  <h4
    style={{
      textAlign: "center",
      marginBottom: "15px",
    }}
  >
    College ID Card
  </h4>

  <img
    src={selectedId}
    alt="College ID"
    style={{
      width: "100%",
      maxHeight: "420px",
      objectFit: "contain",
      borderRadius: "12px",
      border: "2px solid #ddd",
      background: "#fafafa",
      padding: "10px",
      boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
    }}
  />

  <p
    style={{
      marginTop: "12px",
      textAlign: "center",
      color: "#666",
      fontSize: "14px",
    }}
  >
    College ID uploaded by the student.
  </p>
</div>

</div>

          <div
            style={{
              marginTop: "20px",
              display: "flex",
              justifyContent: "center",
              gap: "15px",
            }}
          >
            {selectedUser.role === "organizer" &&
 !selectedUser.approved && (
  <>
    <button
      className="status-pill"
      onClick={async () => {
        await api.approveOrganizer(selectedUser._id);

        setSelectedId(null);
        setSelectedUser(null);

        load();
      }}
    >
      ✅ Approve Organizer
    </button>

    <button
      className="delete-btn"
      onClick={async () => {
        const reason = prompt(
          "Reason for rejecting this organizer:"
        );

        if (!reason) return;

        await api.rejectOrganizer(
          selectedUser._id,
          reason
        );

        setSelectedId(null);
        setSelectedUser(null);

        load();
      }}
    >
      ❌ Reject Organizer
    </button>
  </>
)}

           

            <button
              className="link-btn"
              onClick={() => {
                setSelectedId(null);
                setSelectedUser(null);
              }}
            >
              Close
            </button>
          </div>
        </>
      )}
    </div>
  </div>
)}
    </div>
  
  )}
