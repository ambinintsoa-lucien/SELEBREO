import { useNavigate } from "react-router-dom";

export default function CreateSelectionScreen() {
  const navigate = useNavigate();
  return (
    <div className="screen-no-nav">
      <button className="back-btn" onClick={() => navigate(-1)}>←</button>
      <h2 className="text-jaune text-center">Publier</h2>
      <p className="text-center text-grisfonce">Choisis le type de contenu</p>

      <div onClick={() => navigate("/video-recording")}
        className="card flex items-center gap-4 cursor-pointer mt-10">
        <div className="w-10 h-10 rounded-lg bg-jaune flex items-center justify-center">🎥</div>
        <div>
          <p className="m-0 font-semibold">Vidéo</p>
          <p className="m-0 text-[13px] text-grisfonce">Enregistre ou importe une vidéo</p>
        </div>
      </div>

      <button className="btn-secondary mt-auto" onClick={() => navigate(-1)}>Annuler</button>
    </div>
  );
}
