import React, { useEffect, useState } from "react";
import "./ConfirmationModal.css";
export default function ConfirmationModal({
  title,
  message,
  bodyList,
  inputLabel,
  inputType = "text",
  inputPlaceholder = "",
  inputRequired = false,
  selectLabel,
selectOptions = [],
selectValue = "",
onSelectChange,
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
}, [loading,onCancel]);

  const handleConfirmClick = () => {
  if (selectLabel && !selectValue) {
    setLocalError("Please select a reason.");
    return;
  }

  if (inputLabel && inputRequired && !value.trim()) {
    setLocalError(`${inputLabel} is required.`);
    return;
  }

  setLocalError("");

 if (selectLabel) {
  onConfirm({
    reason: selectValue,
    description: inputLabel ? value.trim() : "",
  });
} else {
  onConfirm(inputLabel ? value.trim() : undefined);
}
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
        


        {selectLabel && (
  <div className="cm-input-group">
    <label>{selectLabel}</label>

    <select
      value={selectValue}
      onChange={(e) => onSelectChange(e.target.value)}
    >
      <option value="">Select a reason</option>

      {selectOptions.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  </div>
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
