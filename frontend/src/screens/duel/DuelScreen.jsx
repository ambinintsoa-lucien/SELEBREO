import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiClient } from "../../api/client.js";
import UserAvatar from "../../components/UserAvatar.jsx";

export default function DuelScreen() {
  const { duelId } = useParams();
  const navigate = useNavigate();
  const [duel, setDuel] = useState(null);
  const [voted, setVoted] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    apiClient.get(`/api/duels/${duelId}`).then(({ data }) => setDuel(data)).catch(() => {});
  }, [duelId]);

  async function vote(votedForUserId) {
    try {
      await apiClient.post("/api/votes/duels", { duelId, votedForUserId });
      setVoted(true);
      setTimeout(() => navigate(`/duel-result/${duelId}`), 500);
    } catch (e) {
      setError(e.response?.data?.error || "Erreur lors du vote.");
    }
  }

  if (!duel) return <div className="screen-no-nav">Chargement du duel...</div>;

  return (
    <div className="screen-no-nav">
      <button className="back-btn" onClick={() => navigate(-1)}>←</button>
      <p className="text-center text-grisfonce text-xs mt-2">DUEL • {duel.stage?.name?.replace("_", " ")}</p>

      <div className="flex items-center justify-center gap-4 mt-6">
        <div className="text-center">
          <UserAvatar user={duel.participantA} size={100} />
          <p className="font-bold mt-2">{duel.participantA.username}</p>
        </div>
        <span className="text-jaune font-black text-xl">VS</span>
        <div className="text-center">
          <UserAvatar user={duel.participantB} size={100} />
          <p className="font-bold mt-2">{duel.participantB.username}</p>
        </div>
      </div>

      <p className="text-center mt-8 font-semibold">Qui mérite de continuer ?</p>
      {error && <p className="text-center text-red-400 text-sm">{error}</p>}

      <button className="btn-primary mt-4" disabled={voted} onClick={() => vote(duel.participantA.id)}>
        Voter {duel.participantA.username}
      </button>
      <button className="btn-secondary mt-2.5" disabled={voted} onClick={() => vote(duel.participantB.id)}>
        Voter {duel.participantB.username}
      </button>

      {voted && <p className="text-center text-jaune mt-4">Vote enregistré !</p>}
    </div>
  );
}
