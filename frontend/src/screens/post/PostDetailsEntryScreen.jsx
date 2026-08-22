import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { apiClient } from "../../api/client.js";

export default function PostDetailsEntryScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const videoUrl = location.state?.videoUrl;

  const [description, setDescription] = useState("");
  const [categories, setCategories] = useState([]);
  const [categoryId, setCategoryId] = useState("");

  useEffect(() => {
    // Pas de vidéo reçue (ex. rechargement direct de l'URL) : retour à la sélection.
    if (!videoUrl) {
      navigate("/create", { replace: true });
      return;
    }
    apiClient.get("/api/categories").then(({ data }) => {
      setCategories(data);
      if (data.length) setCategoryId(data[0].id);
    }).catch(() => {});
  }, [videoUrl]);

  function handleNext() {
    navigate("/create/preview", { state: { videoUrl, description, categoryId } });
  }

  if (!videoUrl) return null;

  return (
    <div className="screen-no-nav">
      <div className="flex justify-between items-center">
        <button className="back-btn" onClick={() => navigate(-1)}>←</button>
        <span className="font-bold">Nouvelle vidéo</span>
        <span onClick={handleNext} className="text-jaune font-bold cursor-pointer">Suivant</span>
      </div>

      <video src={videoUrl} controls className="w-full h-[200px] rounded-card object-cover my-4 bg-black" />

      <textarea className="input-field h-[90px] resize-none pt-3"
        placeholder="Ajouter une description..." maxLength={220}
        value={description} onChange={(e) => setDescription(e.target.value)} />
      <p className="text-right text-xs text-grisfonce">{description.length}/220</p>

      <div className="flex justify-between items-center py-3 border-t border-white/10">
        <span>Thème</span>
        <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}
          className="bg-transparent text-jaune font-semibold outline-none">
          {categories.map((c) => <option key={c.id} value={c.id} className="text-noir">{c.name}</option>)}
        </select>
      </div>
    </div>
  );
}
