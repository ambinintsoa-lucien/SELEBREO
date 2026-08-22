import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { uploadVideoRequest } from "../../api/upload.js";

/**
 * Sélection/capture vidéo réelle.
 * `capture="environment"` déclenche l'appareil photo natif sur mobile (web ET Capacitor,
 * aucun plugin natif requis pour ce niveau de fonctionnalité) ; sur desktop, ouvre le
 * sélecteur de fichiers classique.
 */
export default function VideoRecordingScreen() {
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);

  async function handleFileSelected(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setUploading(true);
    try {
      const url = await uploadVideoRequest(file, setProgress);
      navigate("/create/details", { state: { videoUrl: url } });
    } catch (err) {
      setError(err.response?.data?.error || "Échec de l'upload de la vidéo.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2a1f33] to-noir flex flex-col">
      <div className="flex justify-between p-4">
        <span onClick={() => navigate(-1)} className="cursor-pointer text-lg">✕</span>
        <span className="font-bold">Vidéo</span>
        <span className="w-4" />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center gap-4 text-white/40 px-6 text-center">
        {uploading ? (
          <>
            <p>Envoi de la vidéo... {progress}%</p>
            <div className="w-full max-w-[240px] h-2 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-jaune" style={{ width: `${progress}%` }} />
            </div>
          </>
        ) : (
          <p>Sélectionne ou filme une vidéo à publier</p>
        )}
        {error && <p className="text-red-400 text-sm">{error}</p>}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="video/*"
        capture="environment"
        className="hidden"
        onChange={handleFileSelected}
      />

      <div className="flex justify-center items-center p-6">
        <div
          onClick={() => !uploading && inputRef.current?.click()}
          className={`w-[74px] h-[74px] rounded-full border-4 border-white/40 cursor-pointer ${uploading ? "bg-grisfonce" : "bg-blanc"}`}
        />
      </div>
      <p className="text-center text-grisfonce text-xs -mt-2 pb-4">
        {uploading ? "Envoi en cours..." : "Touche pour filmer ou choisir une vidéo"}
      </p>
    </div>
  );
}
