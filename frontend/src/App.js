import React from "react";
import QrScanner from "./components/QrScanner";
import TicketPage from "./components/TicketPage";
import VerifyEmail from "./components/VerifyEmail";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Login from "./components/Login";
import Signup from "./components/Signup";
import EventBrowse from "./components/EventBrowse";
import EventDetail from "./components/EventDetail";
import EventForm from "./components/EventForm";
import OrganizerEvents from "./components/OrganizerEvents";
import EventRegistrations from "./components/EventRegistrations";
import StudentDashboard from "./components/StudentDashboard";
import AdminPanel from "./components/AdminPanel";
import Profile from "./components/Profile";
// import { Routes, Route, Navigate } from "react-router-dom";

function PrivateRoute({ children, roles }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/events" replace />;
  return children;
}

function Shell() {
  const { user } = useAuth();
  return (
    <>
      {user && <Navbar />}
      <div className="page">
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/events" element={<EventBrowse />} />


          {/* <Route path="/" element={<EventBrowse />} /> */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/events/:id" element={<EventDetail />} />
          <Route path="/scanner" element={<QrScanner />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/ticket/:registrationId" element={<TicketPage />} />
          <Route
            path="/my-registrations"
            element={
              <PrivateRoute roles={["student"]}>
                <StudentDashboard />
              </PrivateRoute>
            }
          />

          <Route
            path="/organizer/events"
            element={
              <PrivateRoute roles={["organizer"]}>
                <OrganizerEvents />
              </PrivateRoute>
            }
          />
          <Route
            path="/organizer/events/new"
            element={
              <PrivateRoute roles={["organizer"]}>
                <EventForm />
              </PrivateRoute>
            }
          />
          <Route
            path="/organizer/events/:id/edit"
            element={
              <PrivateRoute roles={["organizer"]}>
                <EventForm />
              </PrivateRoute>
            }
          />
          <Route
            path="/organizer/events/:id/registrations"
            element={
              <PrivateRoute roles={["organizer", "admin"]}>
                <EventRegistrations />
              </PrivateRoute>
            }
          />
          <Route
  path="/profile"
  element={
    <PrivateRoute roles={["student", "organizer", "admin"]}>
      <Profile />
    </PrivateRoute>
  }
/>
          <Route
            path="/admin"
            element={
              <PrivateRoute roles={["admin"]}>
                <AdminPanel />
              </PrivateRoute>
            }
          />
        </Routes>
      </div>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Shell />
      </BrowserRouter>
    </AuthProvider>
  );
}
