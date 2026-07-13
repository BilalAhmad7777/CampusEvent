import { Link } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";
import "./index.css";

const ROLES = [
  {
    key: "student",
    icon: "🎓",
    title: "Student",
    description: "Discover events, register, and manage your tickets.",
    showSignup: true,
  },
  {
    key: "organizer",
    icon: "🧑‍💼",
    title: "Organizer",
    description: "Create events and manage registrations & attendance.",
    showSignup: true,
  },
  {
    key: "admin",
    icon: "🛡️",
    title: "Admin",
    description: "Oversee users, events, and platform reports.",
    showSignup: false,
  },
];

export default function RoleSelection() {
  return (
    <div className="auth-page role-page">
      <div className="auth-theme-toggle">
        <ThemeToggle />
      </div>

      <div className="role-select-card">
        <div className="role-select-header">
          <span className="role-select-mark" />
          <h1>CampusConnect</h1>
          <p className="subtitle">Choose how you'd like to continue</p>
        </div>

        <div className="role-grid">
          {ROLES.map((role) => (
            <div className="role-card" key={role.key}>
              <div className="role-card-icon">{role.icon}</div>
              <h3>{role.title}</h3>
              <p>{role.description}</p>

              <div className="role-card-actions">
                <Link to={`/login/${role.key}`}>
                  <button>Log in</button>
                </Link>

                {role.showSignup && (
                  <Link to={`/signup/${role.key}`}>
                    <button className="role-card-signup">Sign up</button>
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}