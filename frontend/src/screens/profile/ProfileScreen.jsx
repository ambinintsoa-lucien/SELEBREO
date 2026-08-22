import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiClient } from "../../api/client.js";
import BottomNav from "../../components/BottomNav.jsx";
import UserAvatar from "../../components/UserAvatar.jsx";

/** Profil de l'utilisateur connecté ("Mon profil"). */
export default function ProfileScreen() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    apiClient.get("/api/users/me").then(({ data }) => setUser(data)).catch(() => setUser(null));
  }, []);

  if (!user) return <div className="screen">Chargement du profil...</div>;

  return (
    <div className="screen items-center">
      <div className="w-full flex justify-end">
        <span onClick={() => navigate("/settings")} className="cursor-pointer text-lg">⚙️</span>
      </div>

      <UserAvatar user={user} size={90} />
      <h3 className="mt-3">{user.fullName || user.username}</h3>
      <p className="m-0 text-grisfonce">@{user.username}</p>
      {user.bio && <p className="text-center text-[13px] text-grisclair my-1.5">{user.bio}</p>}

      <div className="flex gap-6 my-3.5">
        <Stat label="Publications" value={user._count?.posts ?? 0} />
        <Stat label="Abonnés" value={user._count?.followers ?? 0} />
        <Stat label="Abonnements" value={user._count?.following ?? 0} />
      </div>

      {user.primaryTheme && (
        <div className="card w-full flex justify-between items-center mb-4">
          <span className="text-grisfonce text-sm">Statut compétition</span>
          <span className="text-jaune font-bold text-sm">{user.primaryTheme.name}</span>
        </div>
      )}

      <button className="btn-primary" style={{ width: "80%" }} onClick={() => navigate("/edit-profile")}>
        Modifier le profil
      </button>

      <BottomNav />
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
