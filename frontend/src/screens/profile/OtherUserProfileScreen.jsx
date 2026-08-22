import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiClient } from "../../api/client.js";
import UserAvatar from "../../components/UserAvatar.jsx";

export default function OtherUserProfileScreen() {
  const { username } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [following, setFollowing] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    apiClient.get(`/api/users/${username}`).then(({ data }) => setUser(data)).catch(() => setUser(null));
  }, [username]);

  async function toggleFollow() {
    setBusy(true);
    try {
      if (following) await apiClient.delete(`/api/users/${username}/follow`);
      else await apiClient.post(`/api/users/${username}/follow`);
      setFollowing((f) => !f);
    } catch { /* action non bloquante pour l'UX */ }
    setBusy(false);
  }

  if (!user) return <div className="screen-no-nav">Chargement du profil...</div>;

  return (
    <div className="screen-no-nav items-center">
      <button className="back-btn self-start" onClick={() => navigate(-1)}>←</button>

      <UserAvatar user={user} size={90} />
      <h3 className="mt-3">{user.fullName || user.username}</h3>
      <p className="m-0 text-grisfonce">@{user.username}</p>
      {user.bio && <p className="text-center text-[13px] text-grisclair my-1.5">{user.bio}</p>}

      <div className="flex gap-6 my-3.5">
        <Stat label="Publications" value={user._count?.posts ?? 0} />
        <Stat label="Abonnés" value={user._count?.followers ?? 0} />
        <Stat label="Abonnements" value={user._count?.following ?? 0} />
      </div>

      <div className="flex gap-2.5" style={{ width: "80%" }}>
        <button className="btn-primary" disabled={busy} onClick={toggleFollow}>
          {following ? "Suivi" : "Suivre"}
        </button>
        <button className="btn-secondary" onClick={() => navigate(`/ranked-participant/${username}`)}>
          Classement
        </button>
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="text-center">
      <p className="m-0 font-bold">{value}</p>
      <p className="m-0 text-[11px] text-grisfonce">{label}</p>
    </div>
  );
}
