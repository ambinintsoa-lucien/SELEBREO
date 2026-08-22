import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiClient } from "../../api/client.js";
import UserAvatar from "../../components/UserAvatar.jsx";

export default function EditProfileScreen() {
  const navigate = useNavigate();
  const inputRef = useRef(null);

  const [user, setUser] = useState(null);
  const [fullName, setFullName] = useState("");
  const [bio, setBio] = useState("");
  const [country, setCountry] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    apiClient
      .get("/api/users/me")
      .then(({ data }) => {
        setUser(data);
        setFullName(data.fullName || "");
        setBio(data.bio || "");
        setCountry(data.country || "");
        setAvatarUrl(data.avatarUrl || "");
      })
      .catch(() => {
        setError("Impossible de charger le profil.");
      });
  }, []);

  async function handleAvatarSelected(e) {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Veuillez sélectionner une image.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("L'image ne doit pas dépasser 5 Mo.");
      return;
    }

    setError(null);
    setUploadingAvatar(true);

    try {
      const formData = new FormData();
      formData.append("avatar", file);

      const { data } = await apiClient.post(
        "/api/uploads/avatar",
        formData
      );

      setAvatarUrl(data.url);

      setUser((current) => ({
        ...current,
        avatarUrl: data.url,
      }));
    } catch (err) {
      setError(
        err.response?.data?.error ||
        "Échec de l'envoi de la photo."
      );
    } finally {
      setUploadingAvatar(false);
      e.target.value = "";
    }
  }

  async function handleSave() {
    setSaving(true);
    setError(null);

    try {
      await apiClient.patch("/api/users/me", {
        fullName,
        bio,
        country,
        avatarUrl,
      });

      navigate("/profile");
    } catch (e) {
      setError(
        e.response?.data?.error ||
        "Échec de la mise à jour."
      );
    } finally {
      setSaving(false);
    }
  }

  if (!user) {
    return (
      <div className="screen-no-nav">
        Chargement...
      </div>
    );
  }

  const previewUser = {
    ...user,
    avatarUrl,
  };

  return (
    <div className="screen-no-nav items-center">
      <button
        className="back-btn self-start"
        onClick={() => navigate(-1)}
      >
        ←
      </button>

      <h2>Modifier le profil</h2>

      <div
        className="relative cursor-pointer"
        onClick={() =>
          !uploadingAvatar && inputRef.current?.click()
        }
      >
        <UserAvatar user={previewUser} size={90} />

        <div
          className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-jaune text-noir flex items-center justify-center text-sm font-bold border-2 border-noir"
        >
          +
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleAvatarSelected}
      />

      <button
        type="button"
        onClick={() =>
          !uploadingAvatar && inputRef.current?.click()
        }
        disabled={uploadingAvatar}
        className="text-jaune text-[13px] mt-2 bg-transparent border-none cursor-pointer"
      >
        {uploadingAvatar
          ? "Envoi de la photo..."
          : "Changer la photo"}
      </button>

      <div className="w-full mt-5">
        <label className="text-xs text-grisfonce">
          Nom complet
        </label>

        <input
          className="input-field mt-1 mb-3.5"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />

        <label className="text-xs text-grisfonce">
          Bio
        </label>

        <textarea
          className="input-field h-20 resize-none pt-2.5 mt-1"
          value={bio}
          maxLength={150}
          onChange={(e) => setBio(e.target.value)}
        />

        <label className="text-xs text-grisfonce">
          Pays
        </label>

        <input
          className="input-field mt-1"
          value={country}
          onChange={(e) => setCountry(e.target.value)}
        />
      </div>

      {error && (
        <p className="text-red-400 text-sm mt-2">
          {error}
        </p>
      )}

      <button
        className="btn-primary mt-5"
        disabled={saving || uploadingAvatar}
        onClick={handleSave}
      >
        {saving
          ? "Enregistrement..."
          : "Enregistrer"}
      </button>
    </div>
  );
}