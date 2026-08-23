import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Heart, MessageCircle, Flame, Send, Share2 } from "lucide-react";
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
  const [shareMessages, setShareMessages] = useState({});
  const [likedPosts, setLikedPosts] = useState({});
  const [commentsByPost, setCommentsByPost] = useState({});
  const [commentsLoading, setCommentsLoading] = useState({});

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

  function setPostShareMessage(postId, message) {
    setShareMessages((prev) => ({ ...prev, [postId]: message }));

    setTimeout(() => {
      setShareMessages((prev) => {
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

    const currentlyLiked =
      likedPosts[post.id] ?? post.liked ?? false;

    setActionLoading((prev) => ({
      ...prev,
      [key]: true,
    }));

    try {
      if (currentlyLiked) {
        await apiClient.delete(`/api/posts/${post.id}/like`);
      } else {
        await apiClient.post(`/api/posts/${post.id}/like`);
      }

      setLikedPosts((prev) => ({
        ...prev,
        [post.id]: !currentlyLiked,
      }));

      setPosts((prev) =>
        prev.map((p) => {
          if (p.id !== post.id) return p;

          const currentLikes = Number(p._count?.likes || 0);

          return {
            ...p,
            liked: !currentlyLiked,
            _count: {
              ...p._count,
              likes: currentlyLiked
                ? Math.max(0, currentLikes - 1)
                : currentLikes + 1,
            },
          };
        })
      );
    } catch (err) {
      const message =
        err.response?.data?.error ||
        "Impossible de modifier le like.";

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
      const { data } = await apiClient.post(
        `/api/posts/${post.id}/comments`,
        {
          content,
        }
      );

      setCommentsByPost((prev) => ({
        ...prev,
        [post.id]: [
          data,
          ...(prev[post.id] || []),
        ],
      }));

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

  async function toggleComments(postId) {
    setCommentText("");

    // Fermer
    if (commentingPost === postId) {
      setCommentingPost(null);
      return;
    }

    setCommentingPost(postId);

    // Déjà chargé
    if (commentsByPost[postId]) {
      return;
    }

    setCommentsLoading((prev) => ({
      ...prev,
      [postId]: true,
    }));

    try {
      const { data } = await apiClient.get(
        `/api/posts/${postId}/comments`
      );

      setCommentsByPost((prev) => ({
        ...prev,
        [postId]: data,
      }));
    } catch (err) {
      setPostError(
        postId,
        err.response?.data?.error ||
        "Impossible de charger les commentaires."
      );
    } finally {
      setCommentsLoading((prev) => ({
        ...prev,
        [postId]: false,
      }));
    }
  }

  // PARTAGE — nouvelle fonctionnalité demandée : partage natif si disponible
  // (Web Share API, fonctionne en web mobile ET dans Capacitor), sinon copie du lien.
  async function handleShare(post) {
    const shareUrl = `${window.location.origin}/post/${post.id}`;
    const shareData = {
      title: "SELEBREO",
      text: post.description
        ? post.description
        : `Découvre la vidéo de @${post.author.username} sur SELEBREO`,
      url: shareUrl,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl);
        setPostShareMessage(post.id, "Lien copié dans le presse-papiers !");
      }
    } catch {
      // Annulation du partage natif par l'utilisateur : pas une erreur à afficher.
    }
  }

  return (
    <div className="min-h-screen flex flex-col">

      {/* HEADER — fixe en haut de l'écran (même mécanique que la bottom nav,
          insensible au comportement de scroll du cadre autour). */}
      <header className="top-nav px-5 pt-5 pb-3 overflow-hidden">
        {/* Halo jaune très discret, purement décoratif, derrière le logo */}
        <div className="pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 w-40 h-20 bg-jaune/10 blur-3xl rounded-full" />

        <div className="relative flex items-center justify-between">
          <span className="w-9" />

          <h2 className="text-base font-black m-0 tracking-wide">
            <span className="text-blanc">SELE</span>
            <span className="text-jaune">BREO</span>
          </h2>

          <button
            type="button"
            onClick={() => navigate("/search")}
            aria-label="Rechercher"
            className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center active:scale-90 hover:bg-white/10 transition-all"
          >
            <Search size={17} strokeWidth={2.25} className="text-blanc" />
          </button>
        </div>

        <p className="relative text-center text-grisfonce text-[11px] tracking-wide mt-1.5 mb-0">
          Découvre les talents qui montent <span className="text-jaune/80">aujourd'hui</span>
        </p>
      </header>

      {/* CONTENU — pt-24 compense la hauteur du header désormais fixe (hors flux) */}
      <div className="flex-1 px-5 pt-24 pb-24">

        {/* CHARGEMENT — cartes fantômes plutôt qu'un simple texte */}
        {loading && (
          <div className="flex flex-col gap-6">
            {[0, 1].map((i) => (
              <div key={i} className="rounded-2xl overflow-hidden bg-surface border border-white/5">
                <div className="h-[280px] bg-white/5 animate-pulse" />
                <div className="p-4 flex flex-col gap-2.5">
                  <div className="h-3 w-2/3 bg-white/5 rounded animate-pulse" />
                  <div className="h-3 w-1/3 bg-white/5 rounded animate-pulse" />
                  <div className="h-11 w-full bg-white/5 rounded-xl animate-pulse mt-1.5" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* AUCUNE PUBLICATION */}
        {!loading && posts.length === 0 && (
          <div className="flex flex-col items-center text-center py-16 px-4">
            <div className="w-16 h-16 rounded-full bg-jaune/10 border border-jaune/20 flex items-center justify-center mb-4">
              <Flame size={26} strokeWidth={2} className="text-jaune" />
            </div>
            <p className="text-blanc text-sm font-semibold mb-1">
              Aucune publication pour l'instant
            </p>
            <p className="text-grisfonce text-xs">
              Sois le premier à briller sur SELEBREO.
            </p>
          </div>
        )}

        {/* PUBLICATIONS */}
        <div className="flex flex-col gap-6">

          {posts.map((post) => (
            <article
              key={post.id}
              className="rounded-2xl overflow-hidden bg-surface border border-white/5 shadow-lg hover:border-white/10 transition-colors"
            >

              {/* BLOC VIDÉO — auteur incrusté en HAUT À GAUCHE (jamais en bas,
                  pour ne pas chevaucher la barre de contrôle/minuterie native
                  du lecteur vidéo, qui reste en bas de la vidéo). */}
              <div className="relative bg-black">
                <video
                  src={post.videoUrl}
                  controls
                  playsInline
                  className="w-full block bg-black object-contain"
                  style={{ maxHeight: 420 }}
                />

                {/* Dégradé léger en haut pour la lisibilité du bloc auteur */}
                <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black/70 to-transparent" />

                <div
                  className="absolute left-3 top-3 right-16 flex items-center gap-2.5 cursor-pointer pointer-events-auto active:scale-[0.98] transition-transform w-fit max-w-full"
                  onClick={() => navigate(`/user-profile/${post.author.username}`)}
                >
                  <UserAvatar user={post.author} size={30} />
                  <div className="min-w-0">
                    <p className="m-0 font-bold text-[13px] truncate text-white leading-tight">
                      @{post.author.username}
                    </p>
                    {post.category?.name && (
                      <span className="text-[10px] text-jaune font-semibold leading-tight">
                        {post.category.name}
                      </span>
                    )}
                  </div>
                </div>
                {/* PARTAGE — en bas à droite, au-dessus de la barre de contrôle
                    native de la vidéo (décalé de 48px du bas pour ne jamais
                    chevaucher la minuterie/scrubber). */}
                <button
                  type="button"
                  onClick={() => handleShare(post)}
                  className="absolute right-3 bottom-12 w-9 h-9 rounded-full bg-black/55 backdrop-blur border border-white/15 flex items-center justify-center active:scale-90 hover:bg-black/70 transition-all pointer-events-auto"
                  aria-label="Partager sur un autre réseau social"
                >
                  <Share2 size={16} strokeWidth={2.25} className="text-white" />
                </button>

                {shareMessages[post.id] && (
                  <span className="absolute right-3 bottom-[92px] bg-black/80 text-jaune text-[11px] font-semibold px-2.5 py-1 rounded-full whitespace-nowrap">
                    {shareMessages[post.id]}
                  </span>
                )}
              </div>

              {/* BLOC CONTENU */}
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
                      rounded-2xl
                      bg-white/5
                      border border-white/10
                      flex items-center justify-center gap-2
                      text-sm
                      text-white
                      active:scale-[0.96]
                      hover:bg-white/10
                      hover:border-white/20
                      transition-all
                      disabled:opacity-50
                    "
                  >
                    <Heart
                      size={17}
                      strokeWidth={2.25}
                      fill={
                        likedPosts[post.id] ?? post.liked
                          ? "currentColor"
                          : "none"
                      }
                      className={
                        likedPosts[post.id] ?? post.liked
                          ? "text-[#FF5C7A]"
                          : "text-white"
                      }
                    />

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
                      rounded-2xl
                      bg-white/5
                      border border-white/10
                      flex items-center justify-center gap-2
                      text-sm
                      text-white
                      active:scale-[0.96]
                      hover:bg-white/10
                      hover:border-white/20
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
                      rounded-2xl
                      bg-jaune
                      text-noir
                      flex items-center justify-center gap-2
                      text-sm
                      font-bold
                      active:scale-[0.96]
                      hover:brightness-110
                      transition-all
                      disabled:opacity-50
                      shadow-[0_0_14px_rgba(255,212,59,0.35)]
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
                  <div className="mt-4">

                    <div className="mb-3">
                      <p className="text-sm font-bold text-white">
                        Commentaires
                        <span className="text-grisfonce ml-1">
                          ({post._count.comments})
                        </span>
                      </p>
                    </div>

                    {commentsLoading[post.id] && (
                      <p className="text-xs text-grisfonce py-3">
                        Chargement des commentaires...
                      </p>
                    )}

                    {!commentsLoading[post.id] &&
                      commentsByPost[post.id]?.length === 0 && (
                        <p className="text-xs text-grisfonce py-3">
                          Aucun commentaire pour le moment.
                        </p>
                      )}

                    {commentsByPost[post.id]?.length > 0 && (
                      <div className="flex flex-col gap-3 max-h-72 overflow-y-auto mb-3">
                        {commentsByPost[post.id].map((comment) => (
                          <div
                            key={comment.id}
                            className="flex gap-2.5 rounded-xl bg-white/5 border border-white/5 p-3"
                          >
                            <UserAvatar
                              user={comment.user}
                              size={32}
                            />

                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-bold text-white">
                                @{comment.user.username}
                              </p>

                              <p className="text-sm text-white/80 mt-1 break-words">
                                {comment.content}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    <form
                      onSubmit={(e) => handleCommentSubmit(e, post)}
                      className="flex gap-2 mt-3 animate-[fadeIn_0.15s_ease-out]"
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
                        px-4
                        rounded-2xl
                        bg-white/5
                        border border-white/10
                        text-white
                        text-sm
                        outline-none
                        focus:border-jaune/60
                        focus:bg-white/[0.07]
                        transition-colors
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
                        rounded-2xl
                        bg-jaune
                        text-noir
                        font-bold
                        flex items-center justify-center
                        active:scale-[0.94]
                        hover:brightness-110
                        transition-all
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

                  </div>
                )}

              </div>
            </article>
          ))}

        </div>
      </div>

      <BottomNav />

    </div>
  );
}