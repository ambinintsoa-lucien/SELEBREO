import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiClient } from "../../api/client.js";

export default function ProfileCreationScreen() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [primaryThemeId, setPrimaryThemeId] = useState("");
  const [error, setError] = useState(null);

  useEffect(() => {
    apiClient.get("/api/categories").then(({ data }) => setCategories(data)).catch(() => {});
  }, []);

  async function handleNext() {
    try {
      await apiClient.patch("/api/users/me", { fullName, primaryThemeId });
      navigate("/theme-selection");
    } catch (e) {
      setError(e.response?.data?.error || "Erreur lors de la mise à jour.");
    }
  }

  return (
    <div className="screen-no-nav">
      <div className="flex justify-between items-center">
        <button className="back-btn" onClick={() => navigate(-1)}>←</button>
        <span className="text-grisfonce">1/3</span>
      </div>

      <h2 className="text-center text-grisclair">Créer ton profil</h2>
      <div className="w-[90px] h-[90px] rounded-full bg-[#222] mx-auto my-4 flex items-center justify-center text-2xl">👤</div>

      <label className="text-[11px] text-grisfonce tracking-wide">NOM D'UTILISATEUR</label>
      <input className="input-field mt-1 mb-3.5" placeholder="@ username" value={username} onChange={(e) => setUsername(e.target.value)} />

      <label className="text-[11px] text-grisfonce tracking-wide">NOM COMPLET</label>
      <input className="input-field mt-1 mb-3.5" placeholder="Nom complet" value={fullName} onChange={(e) => setFullName(e.target.value)} />

      <label className="text-[11px] text-grisfonce tracking-wide">CHOISIS TON THÈME PRINCIPAL</label>
      <select className="input-field mt-1" value={primaryThemeId} onChange={(e) => setPrimaryThemeId(e.target.value)}>
        <option value="">Sélectionner un thème</option>
        {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
      </select>

      {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
      <button className="btn-primary mt-7" onClick={handleNext}>Suivant</button>
    </div>
  );
}
