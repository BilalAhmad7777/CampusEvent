import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../api";
import "./index.css";
import { COLLEGES } from "./colleges";

const emptyForm = {
  title: "",
  description: "",
  venue: "",
  college: "",
  date_time: "",
  category: "",
  max_participants: 50,
  registration_deadline: "",
  poster_url: "",
  allowed_colleges: [],
  allowed_courses: [],
  allowed_departments: [],
  allowed_years: [],

};




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

  
college: form.college,


  venue:
    form.venue === "Other"
      ? customVenue
      : form.venue,

  allowed_colleges: form.allowed_colleges,
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

  {COLLEGES.map((college) => (
    <option key={college} value={college}>
      {college}
    </option>
  ))}
</select>



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

</div>




<div className="chip-row">
  {form.allowed_colleges.map((college) => (
      <div className="chip" key={college}>
        {college}

        <button
          type="button"
          className="chip-remove"
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