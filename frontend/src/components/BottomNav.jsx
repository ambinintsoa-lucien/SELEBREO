import { NavLink } from "react-router-dom";
import { Home, Trophy, Bell, User, Plus } from "lucide-react";

export default function BottomNav() {
  const linkClass = ({ isActive }) => (isActive ? "active" : "");

  return (
    <nav className="bottom-nav">
      <NavLink to="/home" className={linkClass}>
        {({ isActive }) => (
          <>
            <span className={`nav-icon-wrap ${isActive ? "nav-icon-wrap--active" : ""}`}>
              <Home size={20} strokeWidth={2.4} />
            </span>
            Accueil
          </>
        )}
      </NavLink>

      <NavLink to="/ranking" className={linkClass}>
        {({ isActive }) => (
          <>
            <span className={`nav-icon-wrap ${isActive ? "nav-icon-wrap--active" : ""}`}>
              <Trophy size={20} strokeWidth={2.4} />
            </span>
            Classement
          </>
        )}
      </NavLink>

      <NavLink to="/create">
        <div className="create-btn">
          <Plus size={22} strokeWidth={3} />
        </div>
      </NavLink>

      <NavLink to="/notifications" className={linkClass}>
        {({ isActive }) => (
          <>
            <span className={`nav-icon-wrap ${isActive ? "nav-icon-wrap--active" : ""}`}>
              <Bell size={20} strokeWidth={2.4} />
            </span>
            Notifs
          </>
        )}
      </NavLink>

      <NavLink to="/profile" className={linkClass}>
        {({ isActive }) => (
          <>
            <span className={`nav-icon-wrap ${isActive ? "nav-icon-wrap--active" : ""}`}>
              <User size={20} strokeWidth={2.4} />
            </span>
            Profil
          </>
        )}
      </NavLink>
    </nav>
  );
}