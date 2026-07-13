import React from "react";
import { useNavigate } from "react-router-dom";
import ForgotPasswordModal from "./ForgotPasswordModal";

/**
 * Standalone /forgot-password route — kept as a fallback for anyone who
 * lands here directly (bookmark, shared link, etc). Reuses the same
 * ForgotPasswordModal component so there's only one copy of the logic;
 * "closing" it here just navigates back to the role selection screen.
 */
export default function ForgotPassword() {
  const navigate = useNavigate();

  return <ForgotPasswordModal onClose={() => navigate("/")} />;
}