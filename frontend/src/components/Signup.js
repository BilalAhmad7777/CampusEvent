import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../context/AuthContext";
import "./index.css";
import TermsModal from "../components/TermsModal";
import ThemeToggle from "./ThemeToggle";
import { COLLEGES } from "./colleges";


export default function Signup({role}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const signupRole = role;
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [profilePhoto, setProfilePhoto] = useState("");
const [uploading, setUploading] = useState(false);
const [preview, setPreview] = useState("");
const [collegeId, setCollegeId] = useState("");
const [rollNumber, setRollNumber] = useState("");
const [college, setCollege] = useState("");
const [idPreview, setIdPreview] = useState("");
const [uploadingId, setUploadingId] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  

  const [showTerms, setShowTerms] = useState(false);
const [acceptedTerms, setAcceptedTerms] = useState(false);

const handleImageUpload = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  setUploading(true);
  setError("");

  const data = new FormData();
  data.append("file", file);
  data.append("upload_preset", "event-handler");

  try {
    const response = await fetch(
      "https://api.cloudinary.com/v1_1/lyvwqhnu/image/upload",
      {
        method: "POST",
        body: data,
      }
    );

    const result = await response.json();

    setPreview(result.secure_url);
    setProfilePhoto(result.secure_url);
  } catch (err) {
    setError("Profile photo upload failed");
  }

  setUploading(false);
};


const handleCollegeIdUpload = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  setUploadingId(true);
  setError("");

  const data = new FormData();
  data.append("file", file);
  data.append("upload_preset", "event-handler");

  try {
    const response = await fetch(
      "https://api.cloudinary.com/v1_1/lyvwqhnu/image/upload",
      {
        method: "POST",
        body: data,
      }
    );

    const result = await response.json();

    setIdPreview(result.secure_url);
    setCollegeId(result.secure_url);
  } catch (err) {
    setError("College ID upload failed");
  }

  setUploadingId(false);
};

  const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");
  setInfo("");
  
  if (!profilePhoto) {
  setError("Please upload your profile photo.");
  return;
}

if (!collegeId) {
  setError("Please upload your college ID.");
  return;
}
  try {
    await api.signup(
      email,
      password,
      name,
      signupRole,
      rollNumber,
      profilePhoto,
      collegeId,
      college

    );

    navigate("/verify-email", {
      state: {
        email,
      },
    });

  } catch (err) {
    setError(err.message);
  }
};

  return (
    <div className="auth-page">
      <div className="auth-theme-toggle">
        <ThemeToggle />
      </div>

      <form className="auth-card" onSubmit={handleSubmit}>
        <h1>
  {signupRole === "student"
    ? "Student Sign Up"
    : "Organizer Sign Up"}
</h1>
 <Link
        to="/"
        style={{
          textDecoration: "none",
          color: "#6d28d9",
          fontWeight: "600",
          marginBottom: "1px",
          display: "inline-block",
        }}
      >
        ← Back
      </Link>
<p className="subtitle">
  Create your {signupRole} account
</p>
        {error && <div className="error">{error}</div>}
        {info && <div className="info">{info}</div>}
        <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required />
        
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        

<label>College</label>

<select
  value={college}
  onChange={(e) => setCollege(e.target.value)}
  required
>
  <option value="">Select College</option>

  {COLLEGES.map((c) => (
    <option key={c} value={c}>
      {c}
    </option>
  ))}
</select>
       {signupRole === "student" && (
  <input
    type="text"
    placeholder="College Roll Number"
    value={rollNumber}
    onChange={(e) => setRollNumber(e.target.value)}
    required
  />
)}      
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />


        <label>Profile Photo</label>

<input
  type="file"
  accept="image/*"
  onChange={handleImageUpload}
/>

{uploading && <p>Uploading photo...</p>}

{preview && (
  <img
    src={preview}
    alt="Profile Preview"
    style={{
      width: "120px",
      height: "120px",
      objectFit: "cover",
      borderRadius: "50%",
      marginTop: "10px",
    }}
  />
)}

<label>College ID Card</label>

<input
  type="file"
  accept="image/*"
  onChange={handleCollegeIdUpload}
/>

{uploadingId && <p>Uploading College ID...</p>}

{idPreview && (
  <img
    src={idPreview}
    alt="College ID Preview"
    style={{
      width: "250px",
      marginTop: "10px",
      borderRadius: "8px",
      border: "1px solid #ddd",
    }}
  />
)}

<div className="terms-check-row">
  <label className="terms-check">
    <input
      type="checkbox"
      checked={acceptedTerms}
      onChange={(e) => setAcceptedTerms(e.target.checked)}
    />

    <span>
      I agree to the{" "}
      <button
        type="button"
        className="terms-check-link"
        onClick={() => setShowTerms(true)}
      >
        Terms & Community Guidelines
      </button>
    </span>
  </label>
</div>
        <button
  type="submit"
  disabled={!acceptedTerms}
>
  Sign Up
</button>
        <p className="switch">
          Already have an account? <Link to={`/login/${signupRole}`}>Log in</Link>
        </p>
      </form>


      {showTerms && (
  <TermsModal
    role={role}
    onAccept={() => {
      setAcceptedTerms(true);
      setShowTerms(false);
    }}
    onDecline={() => {
      setShowTerms(false);
      navigate("/");
    }}
  />
)}
    </div>
  );
}