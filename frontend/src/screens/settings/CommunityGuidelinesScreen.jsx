import { useNavigate } from "react-router-dom";

const SECTIONS = [
  { title: "Respect entre membres", text: "Aucun harcèlement, discours haineux ou contenu discriminatoire n'est toléré." },
  { title: "Contenu authentique", text: "Les publications doivent être tes créations originales." },
  { title: "Équité de la compétition", text: "Toute manipulation de votes entraîne une exclusion du classement." },
  { title: "Signalement", text: "Signale tout contenu qui enfreint ces règles depuis le menu d'une publication." },
];

export default function CommunityGuidelinesScreen() {
  const navigate = useNavigate();
  return (
    <div className="screen-no-nav">
      <button className="back-btn" onClick={() => navigate(-1)}>←</button>
      <h2 className="text-center">Règles communautaires</h2>
      {SECTIONS.map((s) => (
        <div key={s.title} className="mb-4">
          <p className="font-bold text-jaune mb-1">{s.title}</p>
          <p className="text-[13px] text-grisclair m-0">{s.text}</p>
        </div>
      ))}
    </div>
  );
}
