import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiClient } from "../../api/client.js";

export default function ThemeSelectionScreen() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [selected, setSelected] = useState([]);

  useEffect(() => {
    apiClient.get("/api/categories").then(({ data }) => setCategories(data)).catch(() => {});
  }, []);

  function toggle(id) {
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  }

  return (
    <div className="screen-no-nav">
      <div className="flex justify-between items-center">
        <button className="back-btn" onClick={() => navigate(-1)}>←</button>
        <span className="text-grisfonce">2/3</span>
      </div>

      <h2 className="text-center text-jaune">Choisis ton thème</h2>
      <p className="text-center text-grisfonce text-[13px]">Tu pourras en ajouter d'autres plus tard</p>

      <div className="grid grid-cols-2 gap-2.5 mt-4">
        {categories.map((c) => {
          const active = selected.includes(c.id);
          return (
            <div key={c.id} onClick={() => toggle(c.id)}
              className={`p-3.5 rounded-lg text-center cursor-pointer font-semibold ${active ? "bg-jaune text-noir" : "bg-surface text-blanc"}`}>
              {c.name}
            </div>
          );
        })}
      </div>

      <button className="btn-primary mt-6" onClick={() => navigate("/finalize-profile")}>Suivant</button>
    </div>
  );
}
