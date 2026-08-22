import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiClient } from "../../api/client.js";
import UserAvatar from "../../components/UserAvatar.jsx";

export default function ParticipantProfileScreen() {
  const { username } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [ranking, setRanking] = useState(null);

  useEffect(() => {
    apiClient.get(`/api/users/${username}`).then(({ data }) => setUser(data)).catch(() => {});
    apiClient.get("/api/ranking/current").then(({ data }) => {
      const entry = data.entries?.find((e) => e.user.username === username);
      setRanking(entry || null);
    }).catch(() => {});
  }, [username]);

  if (!user) return <div className="screen-no-nav">Chargement...</div>;

  return (
    <div className="screen-no-nav items-center">
      <button className="back-btn self-start" onClick={() => navigate(-1)}>←</button>

      <UserAvatar user={user} size={90} />
      <h3 className="mt-3">{user.fullName || user.username}</h3>
      <p className="m-0 text-grisfonce">@{user.username}</p>
      <p className="text-center text-[13px] text-grisclair my-1.5">{user.bio}</p>

      {ranking && (
        <div className="card w-full flex justify-between my-4">
          <div>
            <p className="m-0 text-xs text-grisfonce">Position</p>
            <p className="m-0 font-black text-jaune">#{data_position(ranking)}</p>
          </div>
          <div>
            <p className="m-0 text-xs text-grisfonce">Points</p>
            <p className="m-0 font-black">{ranking.totalScore.toLocaleString("fr-FR")}</p>
          </div>
          <div>
            <p className="m-0 text-xs text-grisfonce">Publications</p>
            <p className="m-0 font-black">{user._count?.posts ?? 0}</p>
          </div>
        </div>
      )}

      <button className="btn-primary w-full" onClick={() => navigate(`/user-profile/${username}`)}>
        Voir le profil complet
      </button>
    </div>
  );
}

function data_position(entry) {
  return entry.position ?? "-";
}
