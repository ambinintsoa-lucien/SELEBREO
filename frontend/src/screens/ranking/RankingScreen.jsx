import { useEffect, useState } from "react";
import { apiClient } from "../../api/client.js";
import BottomNav from "../../components/BottomNav.jsx";
import UserAvatar from "../../components/UserAvatar.jsx";
import { useNavigate } from "react-router-dom";

export default function RankingScreen() {
  const [data, setData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    apiClient.get("/api/ranking/current").then(({ data }) => setData(data)).catch(() => setData(null));
  }, []);

  const stages = ["TOP_100", "TOP_80", "TOP_40", "TOP_20", "FINALE"];
  const currentStageName = data?.stage?.name;

  return (
    <div className="screen">
      <h2 className="text-center text-xl m-0">Classement</h2>
      <p className="text-center text-jaune text-[13px]">CETTE SEMAINE</p>

      <div className="flex justify-between my-4">
        {stages.map((s) => (
          <span key={s} className={`text-[11px] ${s === currentStageName ? "text-jaune font-bold" : "text-grisfonce"}`}>
            {s.replace("_", " ")}
          </span>
        ))}
      </div>

      {(data?.entries ?? []).map((entry, i) => (
        <div key={entry.id} onClick={() => navigate(`/ranked-participant/${entry.user.username}`)}
          className="flex items-center gap-3 py-2.5 border-b border-white/5 cursor-pointer">
          <span className={`w-6 font-bold ${i < 3 ? "text-jaune" : "text-grisfonce"}`}>{i + 1}</span>
          <UserAvatar user={entry.user} size={36} />
          <div className="flex-1">
            <p className="m-0 font-semibold">{entry.user.username}</p>
            <p className="m-0 text-xs text-grisfonce">{entry.user.primaryTheme?.name}</p>
          </div>
          <span className="text-jaune font-bold text-[13px]">{entry.totalScore} pts</span>
        </div>
      ))}

      {!data?.entries?.length && <p className="text-grisfonce text-center">Aucun classement actif pour l'instant.</p>}

      <BottomNav />
    </div>
  );
}
