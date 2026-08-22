import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiClient } from "../../api/client.js";
import UserAvatar from "../../components/UserAvatar.jsx";
import BottomNav from "../../components/BottomNav.jsx";

/** Recherche + résultats fusionnés (décision produit actée). */
export default function SearchScreen() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    apiClient.get("/api/posts").then(({ data }) => setPosts(data.posts)).catch(() => setPosts([]));
  }, []);

  const q = query.trim().toLowerCase();
  const matchingUsers = q
    ? [...new Map(posts.map((p) => [p.author.username, p.author])).values()]
        .filter((u) => u.username.toLowerCase().includes(q))
    : [];
  const matchingPosts = q
    ? posts.filter((p) => p.description?.toLowerCase().includes(q) || p.category?.name?.toLowerCase().includes(q))
    : posts.slice(0, 4);

  return (
    <div className="screen">
      <input className="input-field mb-5" placeholder="Rechercher un talent, thème, utilisateur..."
        value={query} onChange={(e) => setQuery(e.target.value)} />

      {q && (
        <>
          <p className="text-grisfonce text-[13px] mb-2">Utilisateurs</p>
          {matchingUsers.length === 0 && <p className="text-grisfonce text-sm">Aucun utilisateur trouvé.</p>}
          {matchingUsers.map((u) => (
            <div key={u.id} onClick={() => navigate(`/user-profile/${u.username}`)}
              className="flex items-center gap-2.5 py-2 cursor-pointer">
              <UserAvatar user={u} size={36} />
              <p className="m-0 font-semibold text-sm">@{u.username}</p>
            </div>
          ))}
        </>
      )}

      <p className="text-grisfonce text-[13px] my-3">{q ? "Publications" : "Vidéos populaires"}</p>
      <div className="grid grid-cols-2 gap-2">
        {matchingPosts.map((p) => (
          <div key={p.id} onClick={() => navigate(`/post/${p.id}`)}
            className="h-[100px] rounded-lg bg-surface flex items-center justify-center text-grisfonce text-xs cursor-pointer">
            {p.category?.name}
          </div>
        ))}
      </div>

      <BottomNav />
    </div>
  );
}
