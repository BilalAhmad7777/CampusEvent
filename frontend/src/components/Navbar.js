import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./index.css";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <Link to="/" className="brand">
        Campus Events
      </Link>

      <div className="nav-links">
  <Link to="/">Browse</Link>

  {user && (
    <Link to="/profile">My Profile</Link>
  )}

  {user?.role === "student" && (
    <Link to="/my-registrations">My Events</Link>
  )}

  {(user?.role === "organizer" || user?.role === "admin") && (
    <Link to="/organizer/events">My Created Events</Link>
  )}

  {user?.role === "admin" && (
    <Link to="/admin">Admin Panel</Link>
  )}
</div>

      <div className="nav-right">
        <div className="nav-user">
          {user?.profile_photo && (
            <img
              src={user.profile_photo}
              alt={user.name}
              className="nav-avatar"
            />
          )}

          <div className="nav-user-info">
            <strong>{user?.name}</strong>
            <small>{user?.role}</small>
          </div>
        </div>

        <button className="nav-logout" onClick={handleLogout}>
          Log out
        </button>
      </div>
    </nav>
  );
}