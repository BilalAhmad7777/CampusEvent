import React, { useEffect, useRef, useState } from "react";
import { api } from "../api";
import "./ConfirmationModal.css";
import "./ForgotPasswordModal.css";

/**
 * Forgot-password flow as a modal instead of a page navigation.
 * Usage: {showForgot && <ForgotPasswordModal onClose={() => setShowForgot(false)} />}
 */
export default function ForgotPasswordModal({ onClose }) {
  const [step, setStep] = useState(1); // 1 = email, 2 = otp+password, 3 = success
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [resendTimer, setResendTimer] = useState(0);
  const otpInputRef = useRef(null);

  // Escape to close (matches ConfirmationModal's behavior)
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape" && !loading) onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [loading, onClose]);

  useEffect(() => {
    if (step === 2) {
      setTimeout(() => otpInputRef.current?.focus(), 50);
    }
  }, [step]);

  useEffect(() => {
    if (resendTimer <= 0) return;
    const t = setInterval(() => setResendTimer((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [resendTimer]);

  const sendOtp = async () => {
    setError("");

    if (!email.trim()) {
      setError("Email is required.");
      return;
    }

    setLoading(true);

    try {
      await api.forgotPassword(email.trim());
      setStep(2);
      setResendTimer(30);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async () => {
    if (resendTimer > 0) return;
    setError("");
    setLoading(true);

    try {
      await api.forgotPassword(email.trim());
      setResendTimer(30);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async () => {
    setError("");

    if (!otp.trim()) {
      setError("OTP is required.");
      return;
    }
    if (!password) {
      setError("Password is required.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      await api.resetPassword(email.trim(), otp.trim(), password);
      setStep(3);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e, action) => {
    if (e.key === "Enter") {
      e.preventDefault();
      action();
    }
  };

  return (
    <div className="cm-overlay" onClick={() => !loading && onClose()}>
      <div
        className="cm-box fpm-box"
        style={{ maxWidth: "400px" }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="cm-close"
          onClick={onClose}
          disabled={loading}
          aria-label="Close"
        >
          ✕
        </button>

        {/* ---------- Step 1: email ---------- */}
        {step === 1 && (
          <>
            <div className="fpm-icon">🔑</div>
            <h2>Forgot Password?</h2>
            <p className="fpm-subtitle">
              Enter the email on your account and we'll send you a reset
              code.
            </p>

            <div className="fpm-steps">
              <span className="fpm-dot active" />
              <span className="fpm-dot" />
              <span className="fpm-dot" />
            </div>

            {error && <div className="error">{error}</div>}

            <div className="cm-input-group fpm-field">
              <label>Email</label>
              <input
                type="email"
                placeholder="you@college.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, sendOtp)}
                autoFocus
                disabled={loading}
              />
            </div>

            <button
              type="button"
              className="fpm-submit"
              onClick={sendOtp}
              disabled={loading}
            >
              {loading ? "Sending..." : "Send Reset Code"}
            </button>

            <div className="fpm-back-row">
              <button type="button" className="link-btn" onClick={onClose}>
                Back to login
              </button>
            </div>
          </>
        )}

        {/* ---------- Step 2: otp + new password ---------- */}
        {step === 2 && (
          <>
            <div className="fpm-icon">✉️</div>
            <h2>Enter Reset Code</h2>
            <p className="fpm-subtitle">
              We sent a 6-digit code to
              <br />
              <strong>{email}</strong>
            </p>

            <div className="fpm-steps">
              <span className="fpm-dot done" />
              <span className="fpm-dot active" />
              <span className="fpm-dot" />
            </div>

            {error && <div className="error">{error}</div>}

            <div className="cm-input-group fpm-field">
              <label>OTP</label>
              <input
                ref={otpInputRef}
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="000000"
                className="fpm-otp-input"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="cm-input-group fpm-field">
              <label>New Password</label>
              <input
                type="password"
                placeholder="Enter new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="cm-input-group fpm-field">
              <label>Confirm Password</label>
              <input
                type="password"
                placeholder="Re-enter new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, resetPassword)}
                disabled={loading}
              />
            </div>

            <button
              type="button"
              className="fpm-submit"
              onClick={resetPassword}
              disabled={loading}
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>

            <div className="fpm-resend-row">
              {resendTimer > 0 ? (
                <span>Resend code in {resendTimer}s</span>
              ) : (
                <button
                  type="button"
                  className="link-btn"
                  onClick={resendOtp}
                  disabled={loading}
                >
                  Resend Code
                </button>
              )}
            </div>

            <div className="fpm-back-row">
              <button
                type="button"
                className="link-btn"
                onClick={() => {
                  setStep(1);
                  setOtp("");
                  setPassword("");
                  setConfirmPassword("");
                  setError("");
                }}
              >
                ← Use a different email
              </button>
            </div>
          </>
        )}

        {/* ---------- Step 3: success ---------- */}
        {step === 3 && (
          <>
            <div className="fpm-icon fpm-icon-success">✓</div>
            <h2>Password Reset!</h2>
            <p className="fpm-subtitle">
              Your password has been changed successfully.
              <br />
              You can now log in with your new password.
            </p>

            <button type="button" className="fpm-submit" onClick={onClose}>
              Back to Login
            </button>
          </>
        )}
      </div>
    </div>
  );
}