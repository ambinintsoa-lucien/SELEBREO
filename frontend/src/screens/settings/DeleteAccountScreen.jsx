import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function DeleteAccountScreen() {
  const navigate = useNavigate();
  const [confirmed, setConfirmed] = useState(false);

  function handleDelete() {
    setConfirmed(true);
    localStorage.clear();
    setTimeout(() => navigate("/login"), 1500);
  }

  return (
    <div className="screen-no-nav items-center text-center">
      <button className="back-btn self-start" onClick={() => navigate(-1)}>←</button>
      <div className="text-4xl mt-5">⚠️</div>
      <h2 className="text-red-400">Supprimer le compte</h2>
      <p className="text-grisfonce text-sm mt-2">
        Cette action est <b>irréversible</b>. Toutes tes publications et données seront définitivement supprimées.
      </p>

      {!confirmed ? (
        <button className="btn-primary mt-6" style={{ background: "#FF6B6B" }} onClick={handleDelete}>
          Oui, supprimer définitivement
        </button>
      ) : (
        <p className="text-jaune mt-6">Compte supprimé. Redirection...</p>
      )}

      <button className="btn-secondary mt-2.5" onClick={() => navigate(-1)}>Annuler</button>
    </div>
  );
}
