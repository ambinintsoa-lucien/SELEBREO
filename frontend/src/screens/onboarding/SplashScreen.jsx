import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const SPLASH_DELAY_MS = 2000;

/** Uniquement "SELEBREO" en deux couleurs — rien d'autre. */
export default function SplashScreen() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      const hasToken = !!localStorage.getItem("selebreo_access_token");
      navigate(hasToken ? "/home" : "/login", { replace: true });
    }, SPLASH_DELAY_MS);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <h1 className="text-4xl font-black m-0">
        <span className="text-blanc">SELE</span>
        <span className="text-jaune">BREO</span>
      </h1>
    </div>
  );
}
