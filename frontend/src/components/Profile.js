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
  const [deleteAccountModalOpen, setDeleteAccountModalOpen] = useState(false);

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

    setDeleteAccountModalOpen(true);

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
    <div className="container narrow">
      <h1 style={{ textAlign: "center" }}>My Profile</h1>

      <div className="card profile-card">
        {/* Header */}

        <div className="profile-hero">
          <img
            src={user.profile_photo}
            alt={user.name}
            className="profile-avatar"
          />

          <h2>{user.name}</h2>

          <p className="profile-role-tag">{user.role}</p>
        </div>

        {/* Details */}

        <div className="profile-body">
          <div className="profile-field">
            <strong>📧 Email</strong>
            {maskEmail(user.email)}
          </div>

          <div className="profile-field">
            <strong>🎓 College</strong>
            {user.college}
          </div>

          {user.role === "student" && (
            <div className="profile-field">
              <strong>🆔 Roll Number</strong>
              {user.roll_number}
            </div>
          )}

          <div className="profile-field">
            <strong>👤 Account Type</strong>
            {user.role === "student" && (
              <span className="role-chip role-student">🎓 Student</span>
            )}

            {user.role === "organizer" && (
              <span className="role-chip role-organizer">🧑‍🏫 Organizer</span>
            )}

            {user.role === "admin" && (
              <span className="role-chip role-admin">👑 Admin</span>
            )}
          </div>
        </div>

        {/* Danger Zone */}

        <div className="danger-zone">
          <h3>Danger Zone</h3>

          <p>Deleting your account is permanent. This action cannot be undone.</p>

          {!otpSent ? (
            <button className="danger-btn" onClick={sendOtp}>
              Delete Account
            </button>
          ) : (
            <>
              <input
                type="text"
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />

              <button className="danger-btn" onClick={handleDelete}>
                Confirm Delete
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}