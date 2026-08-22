import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { apiClient } from "../../api/client.js";

export default function PostPreviewScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const { videoUrl, description = "", categoryId } = location.state || {};
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState(null);

  async function handlePublish() {
    setPublishing(true);
    setError(null);
    try {
      await apiClient.post("/api/posts", { videoUrl, description, categoryId, hashtags: [] });
      navigate("/home");
    } catch (err) {
      setError(err.response?.data?.error || "Échec de la publication.");
    } finally {
      setPublishing(false);
    }
  }

  if (!videoUrl) return <div className="screen">Aucune vidéo à prévisualiser.</div>;

  return (
    <div className="screen-no-nav">
      <div className="flex justify-between items-center">
        <button className="back-btn" onClick={() => navigate(-1)}>←</button>
        <span className="font-bold">Aperçu</span>
        <span className="w-6" />
      </div>

      <div className="card mt-4">
        <video src={videoUrl} controls className="w-full h-[200px] rounded-lg object-cover bg-black" />
        <p className="text-sm mt-2">{description || "Aucune description."}</p>
        {error && <p className="text-red-400 text-sm">{error}</p>}
      </div>

      <button className="btn-primary mt-6" disabled={publishing} onClick={handlePublish}>
        {publishing ? "Publication..." : "Publier"}
      </button>
      <button className="btn-secondary mt-2.5" onClick={() => navigate(-1)}>Modifier</button>
    </div>
  );
}
