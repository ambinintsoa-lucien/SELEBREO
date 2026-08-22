import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiClient } from "../../api/client.js";

export default function FinalizeProfileScreen() {
  const navigate = useNavigate();
  const [bio, setBio] = useState("");
  const [country, setCountry] = useState("");
  const [error, setError] = useState(null);

  async function handleFinish() {
    try {
      await apiClient.patch("/api/users/me", { bio, country });
      navigate("/home");
    } catch (e) {
      setError(e.response?.data?.error || "Erreur lors de la finalisation.");
    }
  }

  return (
    <div className="screen-no-nav">
      <div className="flex justify-between items-center">
        <button className="back-btn" onClick={() => navigate(-1)}>←</button>
        <span className="text-grisfonce">3/3</span>
      </div>

      <h2 className="text-center">Finalise ton profil</h2>
      <p className="text-center text-jaune text-[13px]">Dernière étape avant de briller.</p>

      <div className="w-[90px] h-[90px] rounded-full bg-[#222] mx-auto my-4 flex items-center justify-center text-2xl">🙂</div>

      <label className="text-[11px] text-grisfonce">Bio (optionnel)</label>
      <textarea className="input-field h-[90px] resize-none pt-3 mt-1" placeholder="Parle-nous de toi..."
        maxLength={150} value={bio} onChange={(e) => setBio(e.target.value)} />
      <p className="text-right text-[11px] text-grisfonce">{bio.length}/150</p>

      <label className="text-[11px] text-grisfonce">Localisation</label>
      <input className="input-field mt-1" placeholder="Pays" value={country} onChange={(e) => setCountry(e.target.value)} />

      {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
      <button className="btn-primary mt-6" onClick={handleFinish}>Terminer ✓</button>
    </div>
  );
}
