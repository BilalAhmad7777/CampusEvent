import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../context/AuthContext";
import "./index.css";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
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
      role,
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
      <form className="auth-card" onSubmit={handleSubmit}>
        <h1>Campus Events</h1>
        <p className="subtitle">Create your account</p>
        {error && <div className="error">{error}</div>}
        {info && <div className="info">{info}</div>}
        <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required />
        
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <label>College</label>

<input
  type="text"
  placeholder="College Name"
  value={college}
  onChange={(e) => setCollege(e.target.value)}
  required
/> 
       {role === "student" && (
  <input
    type="text"
    placeholder="College Roll Number"
    value={rollNumber}
    onChange={(e) => setRollNumber(e.target.value)}
    required
  />
)}      
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <label className="role-label">I am a:</label>
        <div className="role-toggle">
          <button type="button" className={role === "student" ? "active" : ""} onClick={() => setRole("student")}>
            Student
          </button>
          <button type="button" className={role === "organizer" ? "active" : ""} onClick={() => setRole("organizer")}>
            Organizer
          </button>
        </div>

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


        <button type="submit">Sign up</button>
        <p className="switch">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </form>
    </div>
  );
}
