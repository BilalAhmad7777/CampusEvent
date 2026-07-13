import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../api";
import "./index.css";

const emptyForm = {
  title: "",
  description: "",
  venue: "",
  college: "",
  date_time: "",
  // end_time: "",
  category: "",
  max_participants: 50,
  registration_deadline: "",
  poster_url: "",
  allowed_colleges: [],
  allowed_courses: [],
  allowed_departments: [],
  allowed_years: [],

};

const COLLEGES = [
  "GCET Greater Noida",
  "AKGEC",
  "GL Bajaj",
  "KIET",
  "NIET",
  "Galgotias University",
  "Bennett University",
];

const COURSES = [
  "B.Tech",
  "BCA",
  "MCA",
  "MBA",
  "BBA",
  "M.Tech",
];

const DEPARTMENTS = [
  "CSE",
  "CSE (AI)",
  "CSE (DS)",
  "IT",
  "ECE",
  "EE",
  "ME",
  "CE",
  "VLSI Design & Technology",
];

const YEARS = [
  "1st Year",
  "2nd Year",
  "3rd Year",
  "4th Year",
];

export default function EventForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [form, setForm] = useState(emptyForm);
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState("");
  const [customVenue, setCustomVenue] = useState("");
  const [customCollege, setCustomCollege] = useState("");
  const [otherCollege, setOtherCollege] = useState("");
const [otherCourse, setOtherCourse] = useState("");
const [otherDepartment, setOtherDepartment] = useState("");
const [otherYear, setOtherYear] = useState("");

  const toggleSelection = (field, value) => {
  setForm((prev) => ({
    ...prev,
    [field]: prev[field].includes(value)
      ? prev[field].filter((item) => item !== value)
      : [...prev[field], value],
  }));
};

const addCustomOption = (field, value, setter) => {
  const text = value.trim();

  if (!text) return;

  if (!form[field].includes(text)) {
    setForm((prev) => ({
      ...prev,
      [field]: [...prev[field], text],
    }));
  }

  setter("");
};


const removeOption = (field, value) => {
  setForm((prev) => ({
    ...prev,
    [field]: prev[field].filter((item) => item !== value),
  }));
};




  useEffect(() => {
    api.getCategories().then(setCategories);
    if (isEdit) {
      api.getEvent(id).then((ev) => {
        setForm({
  title: ev.title,
  description: ev.description,
  venue: ev.venue,
  college: ev.college,
  date_time: ev.date_time.slice(0, 16),
  category: ev.category,
  max_participants: ev.max_participants,
  registration_deadline: ev.registration_deadline.slice(0, 16),
  poster_url: ev.poster_url || "",

  allowed_colleges: ev.allowed_colleges || [],
  allowed_courses: ev.allowed_courses || [],
  allowed_departments: ev.allowed_departments || [],
  allowed_years: ev.allowed_years || [],
});
      });
    }
  }, [id]);

  const handleChange = (field) => (e) => setForm({ ...form, [field]: e.target.value });
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

    setForm((prev) => ({
      ...prev,
      poster_url: result.secure_url,
    }));
  } catch (err) {
    setError("Image upload failed");
  }

  setUploading(false);
};

  const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");

const eventData = {
  ...form,

  college:
    form.college === "Other"
      ? customCollege
      : form.college,

  venue:
    form.venue === "Other"
      ? customVenue
      : form.venue,

  allowed_colleges: form.allowed_colleges.filter(
    (c) => c !== "Other"
  ),

  allowed_courses: form.allowed_courses.filter(
    (c) => c !== "Other"
  ),

  allowed_departments: form.allowed_departments.filter(
    (d) => d !== "Other"
  ),

  allowed_years: form.allowed_years.filter(
    (y) => y !== "Other"
  ),
};

  try {
    if (isEdit) {
      await api.updateEvent(id, eventData);
    } else {
      await api.createEvent(eventData);
    }

    navigate("/organizer/events");
  } catch (err) {
    setError(err.message);
  }
};

  return (
    <div className="container narrow">
      <h1>{isEdit ? "Edit Event" : "Create Event"}</h1>
      {error && <div className="error">{error}</div>}
      <form className="event-form" onSubmit={handleSubmit}>
        <label>Title</label>
        <input value={form.title} onChange={handleChange("title")} required />

        <label>Description</label>
        <textarea value={form.description} onChange={handleChange("description")} rows={4} required />


<label>College</label>

<select
  value={form.college}
  onChange={handleChange("college")}
  required
>
  <option value="">Select College</option>
  <option>GCET Greater Noida</option>
  <option>AKGEC</option>
  <option>GL Bajaj</option>
  <option>KIET</option>
  <option>NIET</option>
  <option>Galgotias University</option>
  <option>Bennett University</option>
  <option value="Other">Other</option>
</select>

{form.college === "Other" && (
  <input
    placeholder="Enter College Name"
    value={customCollege}
    onChange={(e) => setCustomCollege(e.target.value)}
    required
  />
)}


<label>Eligible Colleges</label>

<div className="checkbox-group">
  {COLLEGES.map((college) => (
    <label key={college} className="checkbox-item">
      <input
        type="checkbox"
        checked={form.allowed_colleges.includes(college)}
        onChange={() =>
          toggleSelection("allowed_colleges", college)
        }
      />
      {college}
    </label>
  ))}

  <label className="checkbox-item">
    <input
      type="checkbox"
      checked={form.allowed_colleges.includes("Other")}
      onChange={() =>
        toggleSelection("allowed_colleges", "Other")
      }
    />
    Other
  </label>
</div>


{form.allowed_colleges.includes("Other") && (
  <div
    style={{
      display: "flex",
      gap: "10px",
      marginTop: "10px",
    }}
  >
    <input
      type="text"
      placeholder="Enter College Name"
      value={otherCollege}
      onChange={(e) => setOtherCollege(e.target.value)}
    />

    <button
      type="button"
      onClick={() =>
        addCustomOption(
          "allowed_colleges",
          otherCollege,
          setOtherCollege
        )
      }
    >
      + Add
    </button>
  </div>
)}


<div
  style={{
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
    marginTop: "12px",
  }}
>
  {form.allowed_colleges
    .filter((c) => c !== "Other")
    .map((college) => (
      <div
        key={college}
        style={{
          background: "#eef2ff",
          padding: "6px 12px",
          borderRadius: "20px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        {college}

        <button
          type="button"
          onClick={() =>
            removeOption("allowed_colleges", college)
          }
        >
          ×
        </button>
      </div>
    ))}
</div>



        <label>Venue</label>
<select
  value={form.venue}
  onChange={handleChange("venue")}
  required
>
  <option value="">Select Venue</option>

  <option>Central Library</option>
  <option>Main Auditorium</option>
  <option>Seminar Hall</option>
  <option>Conference Hall</option>
  <option>Open Ground</option>

  <option value="Other">Other</option>
</select>

{form.venue === "Other" && (
  <input
    placeholder="Enter Venue"
    value={customVenue}
    onChange={(e) => setCustomVenue(e.target.value)}
    required
  />
)}

        <label>Category</label>
        <select value={form.category} onChange={handleChange("category")} required>
          <option value="">Select category</option>
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>

        <label>Date & Time</label>
<input
  type="datetime-local"
  value={form.date_time}
  onChange={handleChange("date_time")}
  required
/>

        <label>Registration Deadline</label>
        <input type="datetime-local" value={form.registration_deadline} onChange={handleChange("registration_deadline")} required />

        <label>Max Participants</label>
        <input type="number" min="1" value={form.max_participants} onChange={handleChange("max_participants")} required />
       
        <label>Event Poster</label>
<input
  type="file"
  accept="image/*"
  onChange={handleImageUpload}
/>

{uploading && <p>Uploading image...</p>}

{preview && (
  <img
    src={preview}
    alt="Event Poster Preview"
    style={{
      width: "220px",
      marginTop: "10px",
      borderRadius: "8px",
    }}
  />
)}
        <button type="submit">{isEdit ? "Save Changes" : "Create Event"}</button>
      </form>
    </div>
  );
}
