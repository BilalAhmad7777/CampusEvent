<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:0B1020,45:4F46E5,100:EC4899&height=230&section=header&text=CampusEvent&fontSize=64&fontColor=ffffff&animation=fadeIn&fontAlignY=38&desc=A%20Full-Stack%20Campus%20Event%20Management%20Platform&descAlignY=60&descSize=20" width="100%" alt="CampusEvent"/>

<img src="https://readme-typing-svg.demolab.com?font=Poppins&weight=500&size=18&pause=1400&color=C4B5FD&center=true&vCenter=true&width=700&lines=Role-based+access+for+students%2C+organizers+and+admins;QR+attendance+%C2%B7+Email+OTP+%C2%B7+Analytics+%C2%B7+Reports;Built+with+React+%2B+Flask+%2B+MongoDB" alt="typing"/>

<img src="assets/campus-banner.svg" width="100%" alt="CampusEvent preview"/>

<br/>

Manage campus events with role-based access, QR attendance, email verification, analytics, reporting, and much more.

<br/>

![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=0B1020&labelColor=0B1020)
![Flask](https://img.shields.io/badge/Flask-3.0-FFFFFF?style=for-the-badge&logo=flask&logoColor=white&labelColor=0B1020)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white&labelColor=0B1020)
![JWT](https://img.shields.io/badge/Auth-JWT-F59E0B?style=for-the-badge&logo=jsonwebtokens&logoColor=white&labelColor=0B1020)
![Cloudinary](https://img.shields.io/badge/Image-Cloudinary-3448C5?style=for-the-badge&logo=cloudinary&logoColor=white&labelColor=0B1020)
![License](https://img.shields.io/badge/License-MIT-10B981?style=for-the-badge&labelColor=0B1020)

<br/>

[![Live Demo](https://img.shields.io/badge/%F0%9F%8C%90%20LIVE%20DEMO-campusevent1803.vercel.app-8B5CF6?style=for-the-badge&labelColor=0B1020)](https://campusevent1803.vercel.app)

</div>

<br/>

<p align="center">
  <a href="#-overview">Overview</a> ·
  <a href="#-key-features">Features</a> ·
  <a href="#-tech-stack">Tech Stack</a> ·
  <a href="#-modules">Modules</a> ·
  <a href="#-project-structure">Structure</a> ·
  <a href="#-installation">Installation</a> ·
  <a href="#-roadmap">Roadmap</a> ·
  <a href="#-author">Author</a>
</p>

<img src="https://capsule-render.vercel.app/api?type=rect&color=0:6366F1,50:8B5CF6,100:EC4899&height=3" width="100%" alt="divider"/>

## 🚀 Overview

CampusEvent is a modern full-stack web application designed to simplify campus event management for students, organizers, and administrators.

The platform provides a complete workflow from event creation to attendance tracking using QR codes, organizer approvals, student registrations, waitlists, ratings, reports, analytics dashboards, and secure authentication.

It is built using the MERN-style architecture with a Flask backend, React frontend, MongoDB Atlas database, Cloudinary image storage, and JWT authentication.

<img src="https://capsule-render.vercel.app/api?type=rect&color=0:6366F1,50:8B5CF6,100:EC4899&height=3" width="100%" alt="divider"/>

## ✨ Key Features

<table>
<tr>
<td width="33%" valign="top">

### 👨‍🎓 Student

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

</td>
<td width="33%" valign="top">

### 👨‍💼 Organizer

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

</td>
<td width="33%" valign="top">

### 🛡️ Admin

- Admin Dashboard
- User Management
- Organizer Approval & Rejection
- Delete Users
- Delete Events
- View Reports
- Resolve Reports
- Platform Analytics
- Category Management

</td>
</tr>
</table>

### 👥 User Roles

| Role | Features |
| :--- | :--- |
| 🎓 **Student** | Register, Attend, Rate, Report, QR Ticket |
| 🧑‍💼 **Organizer** | Create Events, Manage Registrations, QR Attendance |
| 🛡️ **Admin** | User Management, Reports, Analytics, Platform Control |

<img src="https://capsule-render.vercel.app/api?type=rect&color=0:6366F1,50:8B5CF6,100:EC4899&height=3" width="100%" alt="divider"/>

## 🛠 Tech Stack

<table>
<tr>
<td width="25%" valign="top">

**🎨 Frontend**

- React
- React Router
- CSS3
- Context API
- Fetch API

</td>
<td width="25%" valign="top">

**⚙️ Backend**

- Flask
- Flask-Mail
- JWT Authentication
- PyMongo
- Werkzeug

</td>
<td width="25%" valign="top">

**🗄️ Database**

- MongoDB Atlas

**☁️ Cloud Services**

- Cloudinary
- Render
- Vercel

</td>
<td width="25%" valign="top">

**🔐 Authentication**

- JWT
- OTP Email Verification
- Password Reset
- Role-Based Authorization

</td>
</tr>
</table>

<img src="https://capsule-render.vercel.app/api?type=rect&color=0:6366F1,50:8B5CF6,100:EC4899&height=3" width="100%" alt="divider"/>

## 📊 Modules

<table>
<tr>
<td valign="top">

- Authentication System
- Event Management
- Registration & Waitlist
- QR Attendance
- Dashboard Analytics

</td>
<td valign="top">

- Ratings & Reviews
- Reporting & Moderation
- Organizer Verification
- Email Notification System
- Image Upload System

</td>
</tr>
</table>

### 🔐 Authentication Features

- JWT Authentication
- Email Verification OTP
- Forgot Password OTP
- Delete Account OTP
- Role-Based Access Control
- Protected Routes

### 📧 Email Notifications

The platform automatically sends emails for:

- Email Verification
- Password Reset
- Organizer Approval
- Organizer Rejection
- Event Cancellation
- Account Deletion OTP

### 📈 Dashboard Analytics

<table>
<tr>
<td width="50%" valign="top">

**Organizer Dashboard**

- Total Events
- Total Registrations
- Attendance Statistics
- Completed Events

</td>
<td width="50%" valign="top">

**Admin Dashboard**

- Users Overview
- Events Overview
- Registration Statistics
- Category Analytics
- Monthly Event Analytics

</td>
</tr>
</table>

### 🌙 UI Features

- Responsive Design
- Dark Mode
- Modern Dashboard Layout
- Interactive Cards
- Modal Confirmations
- Loading States
- Empty State Screens
- Clean Navigation
- Mobile Friendly

<img src="https://capsule-render.vercel.app/api?type=rect&color=0:6366F1,50:8B5CF6,100:EC4899&height=3" width="100%" alt="divider"/>

## 📂 Project Structure

```
CampusEvent
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

<img src="https://capsule-render.vercel.app/api?type=rect&color=0:6366F1,50:8B5CF6,100:EC4899&height=3" width="100%" alt="divider"/>

## ⚙ Installation

### 1 · Clone Repository

```bash
git clone https://github.com/BilalAhmad7777/CampusEvent.git
cd CampusEvent
```

### 2 · Backend

```bash
cd backend

python -m venv .venv

source .venv/bin/activate
```

Windows:

```bash
.venv\Scripts\activate
```

Install dependencies and run:

```bash
pip install -r requirements.txt

python app.py
```

### 3 · Frontend

```bash
cd frontend

npm install

npm start
```

### 🌐 Environment Variables

Backend:

```env
SECRET_KEY=
MONGO_URI=
MAIL_USERNAME=
MAIL_PASSWORD=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

<img src="https://capsule-render.vercel.app/api?type=rect&color=0:6366F1,50:8B5CF6,100:EC4899&height=3" width="100%" alt="divider"/>

## 🔮 Roadmap

Future enhancements:

- [ ] Event Calendar Integration
- [ ] Push Notifications
- [ ] AI Event Recommendations
- [ ] Multi-College Support
- [ ] Certificate Generation
- [ ] Export Analytics
- [ ] Event Chat

## 🎯 Learning Outcomes

Through this project I gained practical experience in:

<table>
<tr>
<td valign="top">

- Full Stack Development
- REST API Design
- Authentication & Authorization
- MongoDB Data Modeling
- JWT Security
- Cloud Image Storage

</td>
<td valign="top">

- Deployment
- Email Automation
- Role-Based Systems
- State Management
- Responsive UI Design

</td>
</tr>
</table>

<img src="https://capsule-render.vercel.app/api?type=rect&color=0:6366F1,50:8B5CF6,100:EC4899&height=3" width="100%" alt="divider"/>

## 👤 Author

<div align="center">

### Bilal Ahmad

B.Tech Electronics Engineering (VLSI Design & Technology)

GCET Greater Noida

[![GitHub](https://img.shields.io/badge/GitHub-BilalAhmad7777-181717?style=for-the-badge&logo=github&labelColor=0B1020)](https://github.com/BilalAhmad7777)

<br/>

### ⭐ If you like this project, consider giving it a star!

Made with ❤️ using React + Flask + MongoDB

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:EC4899,50:4F46E5,100:0B1020&height=120&section=footer" width="100%" alt="footer"/>

</div>
