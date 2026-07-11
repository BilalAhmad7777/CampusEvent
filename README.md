# Campus Event Management System

Full-stack event platform with Student / Organizer / Admin roles, registration + waitlisting, attendance tracking, and analytics dashboards.

**Stack:** React · Flask · MongoDB · JWT auth

---

## 1. Prerequisites

- Python 3.10+
- Node.js 18+ and npm
- A MongoDB database — **use MongoDB Atlas free tier** (mongodb.com/cloud/atlas), it's faster than installing Mongo locally and works the same

## 2. Backend setup

```bash
cd backend
python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
```
Edit `.env` — paste your Atlas connection string as `MONGO_URI`, and any random string as `SECRET_KEY`.

Run it:
```bash
python app.py
```
Test it's alive: `curl http://localhost:5000/api/health`

**Create your admin account** (signup only allows student/organizer — admins are bootstrapped separately, on purpose):
```bash
python create_admin.py
```
Follow the prompts, then log in through the normal login page with that email/password.

## 3. Frontend setup

```bash
cd frontend
npm install
npm start
```
Opens at `http://localhost:3000`.

---

## 4. Manual test checklist (run through this today — this is what "done" looks like)

1. Sign up as a **student** → browse events (empty at first, that's fine)
2. Sign up as an **organizer** (different email) → try creating an event → should be blocked, "pending admin approval"
3. Log in as **admin** (from `create_admin.py`) → Admin Panel → approve the organizer
4. Log back in as organizer → create an event with `max_participants: 2`
5. Sign up 2–3 more student accounts, register all of them for that event → the 3rd should land on the **waitlist**
6. Cancel one confirmed student's registration → confirm the waitlisted one gets auto-promoted
7. As organizer → open that event's Registrations page → mark someone attended → copy CSV
8. As the attended student → check "My Events" → confirm it shows in attendance history
9. As admin → check dashboard charts show registrations by category/month

If any step throws an error, that error message + which step is the fastest way for me to fix it — paste it here.

## 5. What's NOT built (cut for time — mention as "v2 roadmap" in interviews)

- Poster image upload (Cloudinary)
- PDF ticket / QR code generation
- Email notifications
- Dark mode

These are genuinely good "what would you add next" answers in an interview — better than pretending they're done.

## 6. For your resume

> Built a full-stack, role-based campus event management platform (React, Flask, MongoDB, JWT) supporting Student/Organizer/Admin roles, event registration with automatic waitlist promotion, attendance tracking, and admin analytics dashboards.

Be ready to explain: how the waitlist promotion works (first-come-first-served on cancellation), and why organizer accounts require admin approval (prevents spam/fake events on a real campus platform).
