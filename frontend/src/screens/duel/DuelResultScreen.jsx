import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiClient } from "../../api/client.js";
import UserAvatar from "../../components/UserAvatar.jsx";

export default function DuelResultScreen() {
  const { duelId } = useParams();
  const navigate = useNavigate();
  const [duel, setDuel] = useState(null);

  useEffect(() => {
    apiClient.get(`/api/duels/${duelId}`).then(({ data }) => setDuel(data)).catch(() => {});
  }, [duelId]);

  if (!duel) return <div className="screen-no-nav">Chargement du résultat...</div>;

  const resolved = duel.status === "FINISHED" && duel.winner;
  const winner = resolved ? duel.winner : null;
  const loser = resolved ? (duel.winner.id === duel.participantA.id ? duel.participantB : duel.participantA) : null;

  return (
    <div className="screen-no-nav items-center text-center">
      <p className="text-jaune font-bold mt-4">🏆 Résultat du duel</p>

      {resolved ? (
        <>
          <UserAvatar user={winner} size={100} />
          <h2 className="mt-3">{winner.username}</h2>
          <p className="text-jaune font-bold">Gagnant</p>
          <div className="card w-full my-6 flex justify-between items-center">
            <span className="text-grisfonce">Éliminé</span>
            <div className="flex items-center gap-2">
              <span>{loser.username}</span>
              <UserAvatar user={loser} size={28} />
            </div>
          </div>
        </>
      ) : (
        <p className="text-grisfonce mt-6">Le vote est encore en cours — reviens plus tard pour voir le résultat.</p>
      )}

      <button className="btn-primary w-full" onClick={() => navigate("/ranking")}>Voir le classement</button>
      <button className="btn-secondary w-full mt-2.5" onClick={() => navigate("/home")}>Retour à l'accueil</button>
    </div>
  );
}
