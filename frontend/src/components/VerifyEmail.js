import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../context/AuthContext";

export default function VerifyEmail() {
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();

  const email = location.state?.email || "";

  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
const [timer, setTimer] = useState(30);


useEffect(() => {
  if (timer <= 0) return;

  const interval = setInterval(() => {
    setTimer((prev) => prev - 1);
  }, 1000);

  return () => clearInterval(interval);
}, [timer]);


  const handleVerify = async (e) => {
    e.preventDefault();

    setError("");

    try {
      const data = await api.verifyEmail(email, otp);

      login(data.token, data.user);

      navigate("/");

    } catch (err) {
      setError(err.message);
    }
  };

   const handleResend = async () => {
  try {
    setError("");
    setMessage("");

    await api.resendOtp(email);

    setMessage("A new OTP has been sent to your email.");

    setTimer(30);
  } catch (err) {
    setError(err.message);
  }
};

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleVerify}>
        <h1>Email Verification</h1>

        <p className="subtitle">
          Enter the 6-digit code sent to
          <br />
          <strong>{email}</strong>
        </p>

        {error && <div className="error">{error}</div>}
        {message && <div className="info">{message}</div>}

        <input
          type="text"
          maxLength={6}
          placeholder="Enter OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          required
        />

        <button type="submit">
          Verify Email
        </button>

        <div
  style={{
    marginTop: "15px",
    textAlign: "center",
  }}
>
  {timer > 0 ? (
    <small style={{ color: "#666" }}>
      Resend OTP in {timer}s
    </small>
  ) : (
    <button
      type="button"
      className="link-btn"
      onClick={handleResend}
    >
      Resend OTP
    </button>
  )}
</div>


      </form>
    </div>
  );
}