/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // Palette officielle SELEBREO — noms courts pour usage direct (bg-noir, text-jaune...)
        noir: "#0B0B0B",
        blanccasse: "#F7F7F5",
        jaune: "#FFD43B",
        grisclair: "#E8E8E6",
        grisfonce: "#6B6B6B",
        blanc: "#FFFFFF",
        surface: "#151515", // fond de carte, dérivé du noir profond
      },
      borderRadius: {
        card: "14px",
      },
      maxWidth: {
        phone: "430px",
      },
    },
  },
  plugins: [],
};
