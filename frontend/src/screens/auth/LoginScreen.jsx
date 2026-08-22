import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginRequest, registerRequest } from "../../api/auth.js";

/** Écran Login / Inscription */
export default function LoginScreen() {
  const navigate = useNavigate();

  const [tab, setTab] = useState("connexion");

  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();

    setError(null);
    setLoading(true);

    try {
      if (tab === "connexion") {
        const { user, accessToken, refreshToken } =
          await loginRequest(emailOrUsername, password);

        localStorage.setItem("selebreo_access_token", accessToken);
        localStorage.setItem("selebreo_refresh_token", refreshToken);
        localStorage.setItem("selebreo_user", JSON.stringify(user));

        navigate("/home");
      } else {
        const { accessToken, refreshToken, user } =
          await registerRequest({
            email: emailOrUsername,
            username: username,
            password,
          });

        localStorage.setItem("selebreo_access_token", accessToken);
        localStorage.setItem("selebreo_refresh_token", refreshToken);
        localStorage.setItem("selebreo_user", JSON.stringify(user));

        navigate("/profile-creation");
      }
    } catch (err) {
      console.error("Erreur authentification :", err);
      console.error("Réponse serveur :", err.response?.data);

      setError(
        err.response?.data?.error ||
        "Une erreur est survenue."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="screen-no-nav items-center">
      <div className="h-10" />

      <h2 className="text-lg font-black m-0">
        <span className="text-blanc">SELE</span>
        <span className="text-jaune">BREO</span>
      </h2>

      <div className="h-8" />

      {/* Onglets */}
      <div className="flex gap-8">
        <TabLabel
          label="Connexion"
          active={tab === "connexion"}
          onClick={() => {
            setTab("connexion");
            setError(null);
          }}
        />

        <TabLabel
          label="Inscription"
          active={tab === "inscription"}
          onClick={() => {
            setTab("inscription");
            setError(null);
          }}
        />
      </div>

      <div className="h-7" />

      <form
        onSubmit={handleSubmit}
        className="w-full flex flex-col gap-3.5"
      >
        {/* EMAIL */}
        <input
          className="input-field"
          type={tab === "inscription" ? "email" : "text"}
          placeholder={
            tab === "inscription"
              ? "Adresse e-mail"
              : "Email ou nom d'utilisateur"
          }
          value={emailOrUsername}
          onChange={(e) => setEmailOrUsername(e.target.value)}
          required
        />

        {/* USERNAME : uniquement pour l'inscription */}
        {tab === "inscription" && (
          <input
            className="input-field"
            type="text"
            placeholder="Nom d'utilisateur"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            minLength={3}
            maxLength={30}
            pattern="[a-zA-Z0-9_.]+"
            title="Utilisez uniquement des lettres, chiffres, _ ou ."
            required
          />
        )}

        {/* MOT DE PASSE */}
        <div className="relative">
          <input
            className="input-field"
            type={showPassword ? "text" : "password"}
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
          />

          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 inset-y-0 bg-transparent border-none text-grisfonce cursor-pointer"
          >
            {showPassword ? "🙈" : "👁️"}
          </button>
        </div>

        {/* MOT DE PASSE OUBLIÉ */}
        {tab === "connexion" && (
          <div className="text-right">
            <span className="text-jaune text-[13px] cursor-pointer">
              Mot de passe oublié ?
            </span>
          </div>
        )}

        {/* ERREUR */}
        {error && (
          <p className="text-red-400 text-[13px] m-0">
            {error}
          </p>
        )}

        {/* BOUTON */}
        <button
          className="btn-primary"
          type="submit"
          disabled={loading}
        >
          {loading
            ? "..."
            : tab === "connexion"
              ? "Se connecter"
              : "S'inscrire"}
        </button>
      </form>

      <div className="h-6" />

      <p className="text-[13px] text-grisfonce">
        {tab === "connexion"
          ? "Pas encore de compte ? "
          : "Déjà un compte ? "}

        <span
          className="text-jaune font-semibold cursor-pointer"
          onClick={() => {
            setTab(
              tab === "connexion"
                ? "inscription"
                : "connexion"
            );
            setError(null);
          }}
        >
          {tab === "connexion"
            ? "S'inscrire"
            : "Se connecter"}
        </span>
      </p>
    </div>
  );
}

function TabLabel({ label, active, onClick }) {
  return (
    <div
      onClick={onClick}
      className="text-center cursor-pointer"
    >
      <span
        className={
          active
            ? "text-jaune font-bold"
            : "text-blanc font-normal"
        }
      >
        {label}
      </span>

      {active && (
        <div className="w-14 h-0.5 bg-jaune mt-1.5" />
      )}
    </div>
  );
}