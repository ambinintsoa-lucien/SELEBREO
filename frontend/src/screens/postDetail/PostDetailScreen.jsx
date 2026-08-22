import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiClient } from "../../api/client.js";
import UserAvatar from "../../components/UserAvatar.jsx";

export default function PostDetailScreen() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [liked, setLiked] = useState(false);
  const [voted, setVoted] = useState(false);
  const [following, setFollowing] = useState(false);

  useEffect(() => {
    apiClient.get(`/api/posts/${postId}`).then(({ data }) => setPost(data)).catch(() => {});
    apiClient.get(`/api/posts/${postId}/comments`).then(({ data }) => setComments(data)).catch(() => {});
  }, [postId]);

  async function handleLike() {
    try {
      if (liked) await apiClient.delete(`/api/posts/${postId}/like`);
      else await apiClient.post(`/api/posts/${postId}/like`);
      setLiked((v) => !v);
      setPost((p) => ({ ...p, _count: { ...p._count, likes: p._count.likes + (liked ? -1 : 1) } }));
    } catch { /* non bloquant */ }
  }

  async function handleVote() {
    if (voted) return;
    try {
      await apiClient.post("/api/votes/posts", { postId });
      setVoted(true);
      setPost((p) => ({ ...p, _count: { ...p._count, votes: p._count.votes + 1 } }));
    } catch { /* non bloquant */ }
  }

  async function handleFollow() {
    try {
      if (following) await apiClient.delete(`/api/users/${post.author.username}/follow`);
      else await apiClient.post(`/api/users/${post.author.username}/follow`);
      setFollowing((v) => !v);
    } catch { /* non bloquant */ }
  }

  async function handleComment(e) {
    e.preventDefault();
    if (!commentText.trim()) return;
    try {
      const { data } = await apiClient.post(`/api/posts/${postId}/comments`, { content: commentText });
      setComments((c) => [data, ...c]);
      setCommentText("");
      setPost((p) => ({ ...p, _count: { ...p._count, comments: p._count.comments + 1 } }));
    } catch { /* non bloquant */ }
  }

  if (!post) return <div className="screen">Chargement...</div>;

  return (
    <div className="screen">
      <button className="back-btn" onClick={() => navigate(-1)}>←</button>

      <div className="flex items-center gap-2.5 my-3">
        <UserAvatar user={post.author} size={40} />
        <div className="flex-1">
          <p className="m-0 font-bold">{post.author.username}</p>
        </div>
        <button onClick={handleFollow}
          className={following ? "btn-secondary" : "btn-primary"} style={{ width: "auto", height: 34, padding: "0 14px", fontSize: 13 }}>
          {following ? "Suivi" : "Suivre"}
        </button>
      </div>

      <video src={post.videoUrl} controls className="w-full rounded-card bg-black" style={{ maxHeight: 320 }} />

      <span className="inline-block bg-jaune text-noir text-[11px] font-bold px-2.5 py-1 rounded-md my-2.5">
        {post.category?.name}
      </span>
      <p className="text-sm">{post.description}</p>

      <div className="flex gap-5 my-2.5">
        <span onClick={handleLike} className={`cursor-pointer ${liked ? "text-jaune" : "text-grisfonce"}`}>{liked ? "♥" : "♡"} {post._count.likes}</span>
        <span className="text-grisfonce">💬 {post._count.comments}</span>
        <span onClick={handleVote} className={`cursor-pointer ${voted ? "text-jaune" : "text-grisfonce"}`}>🗳️ {post._count.votes}</span>
      </div>

      <p className="font-bold mb-2">Commentaires ({comments.length})</p>
      {comments.map((c) => (
        <p key={c.id} className="text-[13px] mb-2"><b>{c.user.username}</b> {c.content}</p>
      ))}

      <form onSubmit={handleComment}>
        <input className="input-field mt-2.5" placeholder="Ajouter un commentaire..."
          value={commentText} onChange={(e) => setCommentText(e.target.value)} />
      </form>
    </div>
  );
}
