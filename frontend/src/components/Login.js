import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../context/AuthContext";
import "./index.css";
// import { Link, useNavigate } from "react-router-dom";

export default function Login( {role} ) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const data = await api.login(email, password, role);
      login(data.token, data.user);
      navigate("/events");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>

        <Link
  to="/"
  style={{
    textDecoration: "none",
    color: "#6d28d9",
    fontWeight: "600",
    marginBottom: "15px",
    display: "inline-block",
  }}
>
  ← Back
</Link>


        <h1>Campus Events</h1>
        <p className="subtitle">Log in to continue</p>
        {error && <div className="error">{error}</div>}
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <div
  style={{
    display: "flex",
    justifyContent: "flex-end",
    marginTop: "8px",
    marginBottom: "18px",
  }}
>
  <Link
    to="/forgot-password"
    style={{
      fontSize: "14px",
      textDecoration: "none",
    }}
  >
    Forgot Password?
  </Link>
</div>
        <button type="submit">Log in</button>
        <p className="switch">
          {role !== "admin" && (
  <p className="switch">
    No account?{" "}
    <Link to={`/signup/${role}`}>Sign up</Link>
  </p>
)} </p>
      </form>
    </div>
  );
}
