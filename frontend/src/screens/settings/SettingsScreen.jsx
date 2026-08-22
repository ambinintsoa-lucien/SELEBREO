import { useNavigate } from "react-router-dom";

const ITEMS = [
  { label: "Compte", icon: "👤", to: "/edit-profile" },
  { label: "Confidentialité", icon: "🔒", to: "/security" },
  { label: "Utilisateurs bloqués", icon: "🚫", to: "/blocked-users" },
  { label: "Sécurité", icon: "🛡️", to: "/security" },
  { label: "Notifications", icon: "🔔", to: "/notifications" },
  { label: "Règles communautaires", icon: "📜", to: "/community-guidelines" },
];

export default function SettingsScreen() {
  const navigate = useNavigate();

  function handleLogout() {
    localStorage.removeItem("selebreo_access_token");
    localStorage.removeItem("selebreo_refresh_token");
    localStorage.removeItem("selebreo_user");
    navigate("/login");
  }

  return (
    <div className="screen-no-nav">
      <button className="back-btn" onClick={() => navigate(-1)}>←</button>
      <h2 className="text-center">Paramètres</h2>

      {ITEMS.map((item) => (
        <div key={item.label} onClick={() => navigate(item.to)}
          className="flex items-center py-3.5 border-b border-white/5 cursor-pointer">
          <span className="mr-3">{item.icon}</span>
          <span className="flex-1">{item.label}</span>
          <span className="text-grisfonce">›</span>
        </div>
      ))}

      <div onClick={() => navigate("/delete-account")} className="flex items-center py-3.5 cursor-pointer">
        <span className="mr-3">🗑️</span>
        <span className="flex-1 text-red-400">Supprimer le compte</span>
        <span className="text-grisfonce">›</span>
      </div>

      <button className="btn-secondary mt-5 text-red-400" onClick={handleLogout}>Se déconnecter</button>
    </div>
  );
}
