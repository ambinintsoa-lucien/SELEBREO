import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiClient } from "../../api/client.js";
import UserAvatar from "../../components/UserAvatar.jsx";

export default function BlockedUsersScreen() {
  const navigate = useNavigate();
  const [blocked, setBlocked] = useState([]);

  useEffect(() => {
    apiClient.get("/api/moderation/blocked").then(({ data }) => setBlocked(data)).catch(() => setBlocked([]));
  }, []);

  async function unblock(username) {
    try {
      await apiClient.delete(`/api/moderation/block/${username}`);
      setBlocked((b) => b.filter((u) => u.username !== username));
    } catch { /* non bloquant */ }
  }

  return (
    <div className="screen-no-nav">
      <button className="back-btn" onClick={() => navigate(-1)}>←</button>
      <h2 className="text-center">Utilisateurs bloqués</h2>

      {blocked.length === 0 && <p className="text-grisfonce text-center mt-5">Aucun utilisateur bloqué.</p>}

      {blocked.map((u) => (
        <div key={u.id} className="flex items-center gap-2.5 py-2.5 border-b border-white/5">
          <UserAvatar user={u} size={36} />
          <span className="flex-1 font-semibold">@{u.username}</span>
          <button onClick={() => unblock(u.username)}
            className="bg-[#1c1c1c] text-blanc border-none rounded-lg px-3 py-1.5 cursor-pointer">
            Débloquer
          </button>
        </div>
      ))}
    </div>
  );
}
