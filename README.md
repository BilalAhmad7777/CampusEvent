<div align="center">

# 🎓 CampusEvent

### A Full-Stack Campus Event Management Platform

Manage campus events with role-based access, QR attendance, email verification, analytics, reporting, and much more.

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![Flask](https://img.shields.io/badge/Flask-3.0-black?logo=flask)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb)
![JWT](https://img.shields.io/badge/Auth-JWT-orange)
![Cloudinary](https://img.shields.io/badge/Image-Cloudinary-blue)
![License](https://img.shields.io/badge/License-MIT-green)

🌐 **Live Demo:** https://campusevent1803.vercel.app

</div>

---

# 🚀 Overview

CampusConnect is a modern full-stack web application designed to simplify campus event management for students, organizers, and administrators.

The platform provides a complete workflow from event creation to attendance tracking using QR codes, organizer approvals, student registrations, waitlists, ratings, reports, analytics dashboards, and secure authentication.

It is built using the MERN-style architecture with a Flask backend, React frontend, MongoDB Atlas database, Cloudinary image storage, and JWT authentication.

---

# ✨ Key Features

## 👨‍🎓 Student

- Secure Signup & Login
- Email OTP Verification
- Forgot Password via OTP
- Browse Upcoming Events
- Search & Advanced Filters
- Register for Events
- Waitlist Support
- Cancel Registration
- QR Ticket Generation
- Attendance Tracking
- Event Rating & Review
- Report Inappropriate Events
- Delete Account with OTP Verification
- Dark Theme Support

---

## 👨‍💼 Organizer

- Create Events
- Edit Events
- Delete Events
- Upload Event Posters
- Registration Approval/Rejection
- QR Attendance Scanner
- Mark Event as Completed
- Organizer Analytics Dashboard
- Email Notifications
- View Event Registrations

---

## 🛡️ Admin

- Admin Dashboard
- User Management
- Organizer Approval & Rejection
- Delete Users
- Delete Events
- View Reports
- Resolve Reports
- Platform Analytics
- Category Management

---

# 🛠 Tech Stack

## Frontend

- React
- React Router
- CSS3
- Context API
- Fetch API

## Backend

- Flask
- Flask-Mail
- JWT Authentication
- PyMongo
- Werkzeug

## Database

- MongoDB Atlas

## Cloud Services

- Cloudinary
- Render
- Vercel

## Authentication

- JWT
- OTP Email Verification
- Password Reset
- Role-Based Authorization

---

# 👥 User Roles

| Role | Features |
|------|----------|
| Student | Register, Attend, Rate, Report, QR Ticket |
| Organizer | Create Events, Manage Registrations, QR Attendance |
| Admin | User Management, Reports, Analytics, Platform Control |

---

# 📊 Major Modules

- Authentication System
- Event Management
- Registration & Waitlist
- QR Attendance
- Dashboard Analytics
- Ratings & Reviews
- Reporting & Moderation
- Organizer Verification
- Email Notification System
- Image Upload System

---

# 🔐 Authentication Features

- JWT Authentication
- Email Verification OTP
- Forgot Password OTP
- Delete Account OTP
- Role-Based Access Control
- Protected Routes

---

# 📧 Email Notifications

The platform automatically sends emails for:

- Email Verification
- Password Reset
- Organizer Approval
- Organizer Rejection
- Event Cancellation
- Account Deletion OTP

---

# 📈 Dashboard Analytics

## Organizer Dashboard

- Total Events
- Total Registrations
- Attendance Statistics
- Completed Events

## Admin Dashboard

- Users Overview
- Events Overview
- Registration Statistics
- Category Analytics
- Monthly Event Analytics

---

# 🌙 UI Features

- Responsive Design
- Dark Mode
- Modern Dashboard Layout
- Interactive Cards
- Modal Confirmations
- Loading States
- Empty State Screens
- Clean Navigation
- Mobile Friendly

---

# 📂 Project Structure

```
CampusConnect
│
├── backend
│   ├── app.py
│   ├── create_admin.py
│   ├── requirements.txt
│   └── ...
│
├── frontend
│   ├── src
│   ├── public
│   └── ...
│
└── README.md
```

---

# ⚙ Installation

## Clone Repository

```bash
git clone https://github.com/BilalAhmad7777/CampusEvent.git
```

```
cd CampusEvent
```

---

## Backend

```bash
cd backend

python -m venv .venv

source .venv/bin/activate
```

Windows

```bash
.venv\Scripts\activate
```

Install Dependencies

```bash
pip install -r requirements.txt
```

Run

```bash
python app.py
```

---

## Frontend

```bash
cd frontend

npm install

npm start
```

---

# 🌐 Environment Variables

Backend

```env
SECRET_KEY=
MONGO_URI=
MAIL_USERNAME=
MAIL_PASSWORD=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

---

# Future Enhancements

- Event Calendar Integration
- Push Notifications
- AI Event Recommendations
- Multi-College Support
- Certificate Generation
- Export Analytics
- Event Chat

---

# Learning Outcomes

Through this project I gained practical experience in:

- Full Stack Development
- REST API Design
- Authentication & Authorization
- MongoDB Data Modeling
- JWT Security
- Cloud Image Storage
- Deployment
- Email Automation
- Role-Based Systems
- State Management
- Responsive UI Design

---

# Author

## Bilal Ahmad

B.Tech Electronics Engineering (VLSI Design & Technology)

GCET Greater Noida

GitHub

https://github.com/BilalAhmad7777

---

<div align="center">

### ⭐ If you like this project, consider giving it a star!

Made with ❤️ using React + Flask + MongoDB

</div>