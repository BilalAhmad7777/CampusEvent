<div align="center">

# 🎓 CampusEvent

**A full-stack event management platform for colleges & universities**

Streamlining the entire event lifecycle — creation, registration, QR attendance, and feedback — through dedicated portals for students, organizers, and admins.

🔗 **[Live Demo](https://campusevent1803.vercel.app/)**

`React` · `Flask` · `MongoDB Atlas` · `JWT` · `Cloudinary` · `Vercel` · `Render`

</div>

---

## 📖 Table of Contents

- [About](#-about)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Roadmap](#-roadmap)
- [Author](#-author)

---

## 📌 About

**CampusEvent** is a full-stack event management platform built for colleges and universities. It replaces the usual scattered mess of WhatsApp broadcasts, paper sign-up sheets, and manual attendance registers with one system that handles the entire event lifecycle:

`Event created` → `Student registers` → `Organizer approves / waitlists` → `QR ticket issued` → `Attendance scanned` → `Feedback collected`

Three dedicated portals — **Student**, **Organizer**, and **Admin** — each get exactly the tools they need, with role-based access control enforced end-to-end.

> 🆕 **Recently added:** an in-app **Report & Moderation** system (students can flag inappropriate events, admins review and resolve reports), a **modal-based Forgot Password** flow (no page reload needed), and a **light/dark theme toggle**.

---

## ✨ Features

<details open>
<summary><strong>🎓 Student Portal</strong></summary>
<br/>

- Secure signup with **email OTP verification**
- Upload profile photo & college ID during registration
- Browse, search, and filter events by category, college, venue & status
- Register for events, with **automatic waitlisting** once capacity is full
- Cancel a registration any time before the event
- View upcoming registrations and past event history
- Download a **digital QR ticket** (PDF) for every approved registration
- Submit **ratings & written feedback** after attending a completed event
- **🚩 Report an event** as spam, fake, inappropriate, or misleading
- Manage profile & securely **delete account via OTP**
- **Reset password from a modal** — no page navigation required

</details>

<details open>
<summary><strong>🧑‍💼 Organizer Portal</strong></summary>
<br/>

- Organizer signup with **admin approval workflow**
- Create, edit, and delete events (edits/deletes lock 7 days before the event)
- Upload event banners via Cloudinary
- Set participant capacity, eligible colleges/courses/departments/years
- Approve or reject pending student registrations with a reason
- **Automatic promotion** of waitlisted students when a seat opens up
- **QR-based attendance scanning** at the event entrance
- Mark events as completed once they've concluded
- Export the participant list as **CSV**
- View student ratings & feedback per event

</details>

<details open>
<summary><strong>🛡️ Admin Portal</strong></summary>
<br/>

- Approve or reject organizer account requests
- View and manage all registered users
- Delete student/organizer accounts (with reason logging)
- Delete inappropriate or policy-violating events
- **🚩 Review & resolve user-submitted reports**
- Dashboard with **charts** — registrations by category & by month
- Platform-wide stats: total users, students, organizers, events, registrations

</details>

<details>
<summary><strong>🔐 Authentication & Security</strong></summary>
<br/>

- JWT-based authentication
- Hashed passwords
- Email OTP verification (signup, password reset, account deletion)
- Role-based access control & protected routes
- Organizer approval gate before account activation

</details>

<details>
<summary><strong>🎟️ Event & Attendance System</strong></summary>
<br/>

- Full event lifecycle: draft → open → closed → completed
- Registration approval + waitlist management
- Unique **QR code** per approved registration
- Scan-to-verify attendance with duplicate check-in prevention
- Post-event ratings & feedback collection

</details>

<details>
<summary><strong>📧 Automated Email Notifications</strong></summary>
<br/>

Emails are sent automatically for: email verification OTP, OTP resend, organizer approval/rejection, registration approval, waitlist confirmation, waitlist promotion, and account-deletion OTP.

</details>

---

## 🛠️ Tech Stack

<table>
<tr>
<td valign="top" width="25%">

**Frontend**
- React.js
- React Router
- Context API
- Recharts (admin charts)
- CSS (custom design system)

</td>
<td valign="top" width="25%">

**Backend**
- Flask
- Flask-JWT-Extended
- Flask-Mail
- PyMongo

</td>
<td valign="top" width="25%">

**Database & Storage**
- MongoDB Atlas
- Cloudinary (images)

</td>
<td valign="top" width="25%">

**Deployment**
- Frontend → Vercel
- Backend → Render

</td>
</tr>
</table>

---

## 📁 Project Structure

```
CampusEvent
│
├── backend
│   ├── app.py
│   ├── cloudinary_config.py
│   ├── create_admin.py
│   └── requirements.txt
│
├── frontend
│   ├── src
│   ├── public
│   └── package.json
│
├── .gitignore
└── README.md
```

---

## 🚀 Getting Started

### Clone the repository

```bash
git clone https://github.com/BilalAhmad7777/CampusEvent1.git
```

### Backend

```bash
cd backend

python -m venv .venv
source .venv/bin/activate   # On Windows: .venv\Scripts\activate

pip install -r requirements.txt

python app.py
```

### Frontend

```bash
cd frontend

npm install
npm start
```

---

## 🔑 Environment Variables

Create a `.env` file inside the `backend` directory:

```env
SECRET_KEY=

MONGO_URI=

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

MAIL_SERVER=
MAIL_PORT=
MAIL_USE_TLS=
MAIL_USERNAME=
MAIL_PASSWORD=
```

> ⚠️ Never commit your real `.env` file — it's already excluded via `.gitignore`.

---

## 🗺️ Roadmap

- [ ] Event reminders
- [ ] Google Calendar integration
- [ ] Certificate generation
- [ ] Push notifications
- [ ] Event analytics dashboard
- [ ] Multi-college support
- [ ] AI-powered event recommendations

---

## 👤 Author

**Bilal Ahmad**
B.Tech Electronics Engineering (VLSI)
Interested in Full Stack Development, Backend Engineering, and Problem Solving.

🔗 GitHub: **[BilalAhmad7777](https://github.com/BilalAhmad7777)**

<div align="center">

⭐ **If you found this project useful, consider giving it a star!** ⭐

</div>