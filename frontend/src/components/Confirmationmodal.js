import React, { useEffect, useState } from "react";
import "./ConfirmationModal.css";

/**
 * Reusable confirmation modal.
 *
 * Props:
 *  - title            (string, required)
 *  - message          (string)  short description under the title
 *  - bodyList         (array)   optional bullet list (e.g. "what happens next")
 *  - inputLabel       (string)  if present, shows an input/textarea
 *  - inputType        ("text" | "otp")  default "text" (textarea), "otp" = short numeric input
 *  - inputPlaceholder (string)
 *  - inputRequired    (bool)    default false
 *  - confirmText       (string) default "Confirm"
 *  - cancelText        (string) default "Cancel"
 *  - danger            (bool)   red confirm button + red title, default false
 *  - loading           (bool)   disables buttons + shows "Please wait..."
 *  - error             (string) parent-supplied error banner (e.g. failed API call)
 *  - onConfirm(value)   called with trimmed input value (or undefined if no input)
 *  - onCancel()
 */
export default function ConfirmationModal({
  title,
  message,
  bodyList,
  inputLabel,
  inputType = "text",
  inputPlaceholder = "",
  inputRequired = false,
  confirmText = "Confirm",
  cancelText = "Cancel",
  danger = false,
  loading = false,
  error = "",
  onConfirm,
  onCancel,
}) {
  const [value, setValue] = useState("");
  const [localError, setLocalError] = useState("");

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape" && !loading) onCancel();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  const handleConfirmClick = () => {
    if (inputLabel && inputRequired && !value.trim()) {
      setLocalError(`${inputLabel} is required.`);
      return;
    }
    setLocalError("");
    onConfirm(inputLabel ? value.trim() : undefined);
  };

  return (
    <div className="cm-overlay" onClick={() => !loading && onCancel()}>
      <div className="cm-box" onClick={(e) => e.stopPropagation()}>
        <button
  type="button"
  className="cm-close"
  onClick={onCancel}
  disabled={loading}
  aria-label="Close"
>
  ✕
</button>
        <h2 className={`cm-title ${danger ? "cm-title-danger" : ""}`}>{title}</h2>

        {message && <p className="cm-message">{message}</p>}

        {bodyList && bodyList.length > 0 && (
          <ul className="cm-list">
            {bodyList.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        )}

        {inputLabel && (
          <div className="cm-input-group">
            <label>{inputLabel}</label>
            {inputType === "otp" ? (
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder={inputPlaceholder || "Enter OTP"}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                autoFocus
              />
            ) : (
              <textarea
                rows={3}
                placeholder={inputPlaceholder}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                autoFocus
              />
            )}
          </div>
        )}

        {(localError || error) && (
          <div className="cm-error">{localError || error}</div>
        )}

        <div className="cm-actions">
          <button
            type="button"
            className="cm-btn cm-btn-cancel"
            onClick={onCancel}
            disabled={loading}
          >
            {cancelText}
          </button>
          <button
            type="button"
            className={`cm-btn ${danger ? "cm-btn-danger" : "cm-btn-confirm"}`}
            onClick={handleConfirmClick}
            disabled={loading}
          >
            {loading ? "Please wait..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}