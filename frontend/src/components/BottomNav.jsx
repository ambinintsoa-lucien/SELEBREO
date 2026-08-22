import { NavLink } from "react-router-dom";

export default function BottomNav() {
  const linkClass = ({ isActive }) => (isActive ? "active" : "");
  return (
    <nav className="bottom-nav">
      <NavLink to="/home" className={linkClass}><span>🏠</span>Accueil</NavLink>
      <NavLink to="/ranking" className={linkClass}><span>🏆</span>Classement</NavLink>
      <NavLink to="/create"><div className="create-btn">＋</div></NavLink>
      <NavLink to="/notifications" className={linkClass}><span>♡</span>Notifs</NavLink>
      <NavLink to="/profile" className={linkClass}><span>◉</span>Profil</NavLink>
    </nav>
  );
}
