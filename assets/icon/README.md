# Icône de l'app SELEBREO

**Spécification validée :** lettre **"S"** seule, fond noir profond (`#0B0B0B`),
lettre en jaune SELEBREO (`#FFD43B`). Pas de wordmark complet dans l'icône
(contrairement au Splash Screen qui affiche "SELEBREO" en toutes lettres).

## Fichiers sources

- `frontend/public/icons/icon-512.svg` — source haute résolution
- `frontend/public/icons/icon-192.svg` — variante pour le favicon web

## Générer l'icône Android (obligatoire avant publication)

Android/Capacitor ont besoin de PNG à plusieurs résolutions, pas d'un SVG brut.
Le plus simple, une fois `npx cap add android` exécuté (voir README racine) :

1. Va sur https://icon.kitchen (ou l'assistant d'icônes intégré à Android Studio :
   clic droit sur `res/` → New → Image Asset).
2. Importe `icon-512.svg` comme source.
3. Choisis un fond "Legacy" uni `#0B0B0B` (déjà inclus dans le SVG, donc un
   fond transparent dans l'outil suffit).
4. Génère : ça remplace automatiquement les dossiers `mipmap-*/ic_launcher.png`
   dans `frontend/android/app/src/main/res/`.

Ce n'est **pas automatisable en amont** ici puisque `android/` n'existe que
localement, après `npx cap add android` sur ta machine.
