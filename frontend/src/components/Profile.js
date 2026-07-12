import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import "./index.css";

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");

  const maskEmail = (email) => {
  if (!email) return "";

  const [name, domain] = email.split("@");

  if (name.length <= 2) {
    return `${name[0]}****@${domain}`;
  }

  return `${name.substring(0, 2)}****${name.substring(name.length - 2)}@${domain}`;
};

  const sendOtp = async () => {
    try {
      await api.sendDeleteOtp();
      alert("OTP sent to your registered email.");
      setOtpSent(true);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async () => {
    if (!otp) {
      alert("Please enter OTP.");
      return;
    }

    if (
      !window.confirm(
        "Are you sure you want to permanently delete your account?"
      )
    )
      return;

    try {
      await api.deleteAccount(otp);

      alert("Account deleted successfully.");

      logout();

      navigate("/events");
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div
      className="container"
      style={{
        maxWidth: "650px",
      }}
    >
      <h1
        style={{
          textAlign: "center",
          marginBottom: "25px",
        }}
      >
        My Profile
      </h1>

      <div
        className="card"
        style={{
          borderRadius: "20px",
          overflow: "hidden",
          boxShadow: "0 8px 25px rgba(0,0,0,.12)",
        }}
      >
        {/* Header */}

       <div
  style={{
    background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
    color: "white",
    padding: "30px",
    textAlign: "center",
  }}
>
          <img
            src={user.profile_photo}
            alt={user.name}
            style={{
              width: "130px",
              height: "130px",
              objectFit: "cover",
              borderRadius: "50%",
              border: "4px solid white",
              marginBottom: "15px",
            }}
          />

          <h2>{user.name}</h2>

          <p
            style={{
              textTransform: "capitalize",
              fontWeight: "600",
            }}
          >
            {user.role}
          </p>
        </div>

        {/* Details */}

        <div
          style={{
            padding: "30px",
          }}
        >
          <div style={{ marginBottom: "15px" }}>
            <strong>📧 Email</strong>
            <br />
            {maskEmail(user.email)}
          </div>

          <div style={{ marginBottom: "15px" }}>
            <strong>🎓 College</strong>
            <br />
            {user.college}
          </div>

          {user.role === "student" && (
            <div style={{ marginBottom: "15px" }}>
              <strong>🆔 Roll Number</strong>
              <br />
              {user.roll_number}
            </div>
          )}

          <div style={{ marginBottom: "15px" }}>
  <strong>👤 Account Type</strong>
  <br />
  {user.role === "student" && (
    <span
      style={{
        color: "#2563eb",
        fontWeight: "600",
      }}
    >
      🎓 Student
    </span>
  )}

  {user.role === "organizer" && (
    <span
      style={{
        color: "#16a34a",
        fontWeight: "600",
      }}
    >
      🧑‍🏫 Organizer
    </span>
  )}

  {user.role === "admin" && (
    <span
      style={{
        color: "#dc2626",
        fontWeight: "600",
      }}
    >
      👑 Admin
    </span>
  )}
</div>
        </div>

        {/* Danger Zone */}

        <div
          style={{
            borderTop: "1px solid #eee",
            padding: "25px",
            background: "#fff8f8",
          }}
        >
          <h3
            style={{
              color: "#dc2626",
            }}
          >
            Danger Zone
          </h3>

          <p
            style={{
              color: "#666",
            }}
          >
            Deleting your account is permanent. This action cannot be undone.
          </p>

          {!otpSent ? (
            <button
              className="danger-btn"
              style={{
                width: "100%",
                marginTop: "15px",
              }}
              onClick={sendOtp}
            >
              Delete Account
            </button>
          ) : (
            <>
              <input
                type="text"
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                style={{
                  marginTop: "15px",
                  marginBottom: "15px",
                }}
              />

              <button
                className="danger-btn"
                style={{
                  width: "100%",
                }}
                onClick={handleDelete}
              >
                Confirm Delete
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}