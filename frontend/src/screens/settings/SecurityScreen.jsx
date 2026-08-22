import { useNavigate } from "react-router-dom";

const ITEMS = ["Modifier le mot de passe", "Confidentialité du compte", "Sessions actives"];

export default function SecurityScreen() {
  const navigate = useNavigate();
  return (
    <div className="screen-no-nav">
      <button className="back-btn" onClick={() => navigate(-1)}>←</button>
      <h2 className="text-center">Sécurité & confidentialité</h2>
      {ITEMS.map((label) => (
        <div key={label} className="flex items-center py-3.5 border-b border-white/5">
          <span className="flex-1">{label}</span>
          <span className="text-grisfonce">›</span>
        </div>
      ))}
    </div>
  );
}
