import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Heart, MessageCircle, Flame, Send, Sparkles } from "lucide-react";
import { apiClient } from "../../api/client.js";
import BottomNav from "../../components/BottomNav.jsx";
import UserAvatar from "../../components/UserAvatar.jsx";

export default function HomeScreen() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentingPost, setCommentingPost] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [actionLoading, setActionLoading] = useState({});
  const [errors, setErrors] = useState({});

  const navigate = useNavigate();

  useEffect(() => {
    loadPosts();
  }, []);

  async function loadPosts() {
    try {
      const { data } = await apiClient.get("/api/posts");
      setPosts(data.posts || []);
    } catch {
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }

  function setPostError(postId, message) {
    setErrors((prev) => ({ ...prev, [postId]: message }));

    setTimeout(() => {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[postId];
        return next;
      });
    }, 3000);
  }

  // J'ADORE
  async function handleLike(post) {
    const key = `like-${post.id}`;

    if (actionLoading[key]) return;

    setActionLoading((prev) => ({
      ...prev,
      [key]: true,
    }));

    try {
      await apiClient.post(`/api/posts/${post.id}/like`);

      setPosts((prev) =>
        prev.map((p) =>
          p.id === post.id
            ? {
              ...p,
              _count: {
                ...p._count,
                likes: p._count.likes + 1,
              },
            }
            : p
        )
      );
    } catch (err) {
      const message =
        err.response?.data?.error ||
        "Impossible d'aimer cette publication.";

      setPostError(post.id, message);
    } finally {
      setActionLoading((prev) => ({
        ...prev,
        [key]: false,
      }));
    }
  }

  // VOTE
  async function handleVote(post) {
    const key = `vote-${post.id}`;

    if (actionLoading[key]) return;

    setActionLoading((prev) => ({
      ...prev,
      [key]: true,
    }));

    try {
      await apiClient.post("/api/votes/posts", {
        postId: post.id,
      });

      setPosts((prev) =>
        prev.map((p) =>
          p.id === post.id
            ? {
              ...p,
              _count: {
                ...p._count,
                votes: p._count.votes + 1,
              },
            }
            : p
        )
      );
    } catch (err) {
      const message =
        err.response?.data?.error ||
        "Impossible de voter pour cette publication.";

      setPostError(post.id, message);
    } finally {
      setActionLoading((prev) => ({
        ...prev,
        [key]: false,
      }));
    }
  }

  // COMMENTAIRE
  async function handleCommentSubmit(e, post) {
    e.preventDefault();

    const content = commentText.trim();

    if (!content) return;

    if (content.length > 500) {
      setPostError(
        post.id,
        "Le commentaire ne peut pas dépasser 500 caractères."
      );
      return;
    }

    const key = `comment-${post.id}`;

    if (actionLoading[key]) return;

    setActionLoading((prev) => ({
      ...prev,
      [key]: true,
    }));

    try {
      await apiClient.post(`/api/posts/${post.id}/comments`, {
        content,
      });

      setPosts((prev) =>
        prev.map((p) =>
          p.id === post.id
            ? {
              ...p,
              _count: {
                ...p._count,
                comments: p._count.comments + 1,
              },
            }
            : p
        )
      );

      setCommentText("");
      setCommentingPost(null);
    } catch (err) {
      const message =
        err.response?.data?.error ||
        "Impossible d'ajouter le commentaire.";

      setPostError(post.id, message);
    } finally {
      setActionLoading((prev) => ({
        ...prev,
        [key]: false,
      }));
    }
  }

  function toggleComments(postId) {
    setCommentText("");

    setCommentingPost((current) =>
      current === postId ? null : postId
    );
  }

  return (
    <div className="screen pb-24">

      {/* HEADER */}
      <div className="flex items-center justify-between mb-5">
        <span className="w-6" />

        <h2 className="text-base font-black m-0">
          <span className="text-blanc">SELE</span>
          <span className="text-jaune">BREO</span>
        </h2>

        <button
          type="button"
          onClick={() => navigate("/search")}
          className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center active:scale-90 transition-transform"
        >
          <Search size={17} strokeWidth={2.25} className="text-blanc" />
        </button>
      </div>

      {/* CHARGEMENT */}
      {loading && (
        <div className="flex justify-center py-10">
          <p className="text-grisfonce text-sm">
            Chargement...
          </p>
        </div>
      )}

      {/* AUCUNE PUBLICATION */}
      {!loading && posts.length === 0 && (
        <div className="text-center py-12">
          <div className="text-4xl mb-3">🎬</div>

          <p className="text-grisfonce text-sm">
            Aucune publication pour l'instant.
          </p>
        </div>
      )}

      {/* PUBLICATIONS */}
      <div className="flex flex-col gap-6">

        {posts.map((post) => (
          <article
            key={post.id}
            className="rounded-2xl overflow-hidden bg-surface border border-white/5 shadow-lg"
          >

            {/* BLOC VIDÉO — l'auteur est incrusté DANS la vidéo (comme TikTok/Reels)
                pour qu'il n'y ait jamais d'ambiguïté sur "à quelle vidéo appartient
                ce profil" en scrollant d'une carte à l'autre. */}
            <div className="relative bg-black">
              <video
                src={post.videoUrl}
                controls
                playsInline
                className="w-full block bg-black object-contain"
                style={{ maxHeight: 420 }}
              />

              {/* Dégradé + barre auteur superposée en bas de la vidéo */}
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/85 to-transparent" />
              <div
                className="absolute left-3 right-3 bottom-3 flex items-center gap-2.5 cursor-pointer pointer-events-auto active:scale-[0.98] transition-transform"
                onClick={() => navigate(`/user-profile/${post.author.username}`)}
              >
                <UserAvatar user={post.author} size={36} />
                <div className="flex-1 min-w-0">
                  <p className="m-0 font-bold text-sm truncate text-white drop-shadow">
                    @{post.author.username}
                  </p>
                  {post.category?.name && (
                    <span className="inline-flex items-center gap-1 text-[11px] text-jaune font-semibold">
                      <Sparkles size={11} strokeWidth={2.5} />
                      {post.category.name}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* BLOC CONTENU — séparé visuellement de la vidéo par le fond de carte
                (bg-surface), pour se lire clairement comme "ce qui accompagne la
                vidéo du dessus", jamais comme un profil séparé. */}
            <div className="p-4">

              {/* DESCRIPTION */}
              {post.description && (
                <p className="text-sm text-blanc mb-4 leading-relaxed">
                  {post.description}
                </p>
              )}

              {/* ACTIONS */}
              <div className="flex items-center gap-2">

                {/* J'ADORE */}
                <button
                  type="button"
                  onClick={() => handleLike(post)}
                  disabled={actionLoading[`like-${post.id}`]}
                  className="
                    flex-1
                    h-11
                    rounded-xl
                    bg-white/5
                    border border-white/10
                    flex items-center justify-center gap-2
                    text-sm
                    text-white
                    active:scale-95
                    hover:bg-white/10
                    transition-all
                    disabled:opacity-50
                  "
                >
                  <Heart size={17} strokeWidth={2.25} className="text-[#FF5C7A]" />
                  <span>
                    {post._count.likes}
                  </span>
                </button>

                {/* COMMENTAIRES */}
                <button
                  type="button"
                  onClick={() => toggleComments(post.id)}
                  className="
                    flex-1
                    h-11
                    rounded-xl
                    bg-white/5
                    border border-white/10
                    flex items-center justify-center gap-2
                    text-sm
                    text-white
                    active:scale-95
                    hover:bg-white/10
                    transition-all
                  "
                >
                  <MessageCircle size={17} strokeWidth={2.25} className="text-blanc" />
                  <span>
                    {post._count.comments}
                  </span>
                </button>

                {/* VOTE */}
                <button
                  type="button"
                  onClick={() => handleVote(post)}
                  disabled={actionLoading[`vote-${post.id}`]}
                  className="
                    flex-1
                    h-11
                    rounded-xl
                    bg-jaune
                    text-noir
                    flex items-center justify-center gap-2
                    text-sm
                    font-bold
                    active:scale-95
                    hover:brightness-110
                    transition-all
                    disabled:opacity-50
                  "
                >
                  <Flame size={17} strokeWidth={2.5} />
                  <span>
                    {post._count.votes}
                  </span>
                </button>

              </div>

              {/* ERREUR */}
              {errors[post.id] && (
                <p className="text-red-400 text-xs mt-3 mb-0">
                  {errors[post.id]}
                </p>
              )}

              {/* COMMENTAIRE */}
              {commentingPost === post.id && (
                <form
                  onSubmit={(e) => handleCommentSubmit(e, post)}
                  className="flex gap-2 mt-3"
                >

                  <input
                    type="text"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Écrire un commentaire..."
                    maxLength={500}
                    autoFocus
                    className="
                      flex-1
                      h-11
                      px-3
                      rounded-xl
                      bg-white/5
                      border border-white/10
                      text-white
                      text-sm
                      outline-none
                      focus:border-jaune
                    "
                  />

                  <button
                    type="submit"
                    disabled={
                      !commentText.trim() ||
                      actionLoading[`comment-${post.id}`]
                    }
                    className="
                      w-11
                      h-11
                      rounded-xl
                      bg-jaune
                      text-noir
                      font-bold
                      flex items-center justify-center
                      active:scale-95
                      transition-transform
                      disabled:opacity-40
                    "
                  >
                    {actionLoading[`comment-${post.id}`] ? (
                      "..."
                    ) : (
                      <Send size={16} strokeWidth={2.5} />
                    )}
                  </button>

                </form>
              )}

            </div>
          </article>
        ))}

      </div>

      <BottomNav />

    </div>
  );
}