# SELEBREO — La minute qui peut te rendre célèbre

Réseau social de découverte de talents avec compétition à élimination
(Top 100 → Top 80 → Top 40 → Top 20 → Top 10 → Top 4 → Top 2 → Top 1).

## Stack

| Couche | Techno |
|---|---|
| Frontend | React (Vite) + React Router |
| Packaging mobile | Capacitor (Android) |
| Backend | Node.js + Express |
| Base de données | PostgreSQL + Prisma ORM |
| Auth | JWT + bcrypt |
| Tâches planifiées | node-cron (calcul automatique du classement) |

## Structure

```
SELEBREO/
├── backend/     → API Node.js + Express + Prisma
├── frontend/    → App React, packagée ensuite en app Android via Capacitor
├── database/    → schéma SQL de référence (lisible indépendamment de Prisma)
├── assets/      → design tokens (palette/typo), spécification de l'icône
└── docs/        → décisions d'architecture
```

## Démarrage rapide (développement local)

### 1. Base de données PostgreSQL (Docker)

```bash
docker compose up -d
```

Ça démarre PostgreSQL sur `localhost:5432` avec les identifiants définis dans `docker-compose.yml`.

### 2. Backend

```bash
cd backend
cp .env.example .env
npm install
npx prisma migrate dev --name init
npm run dev
```

L'API tourne sur `http://localhost:4000`.

### 3. Frontend (web, pour développer rapidement dans le navigateur)

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

### 4. Frontend → app Android (test sur téléphone réel)

Le téléphone doit être sur le **même réseau Wi-Fi** que le PC. Dans `frontend/.env`,
mets `VITE_API_URL` sur l'IP locale du PC (pas `localhost` — voir `docs/local-android-testing.md`).

```bash
cd frontend
npm run build
npx cap add android        # première fois seulement — génère le dossier android/
npx cap sync android
npx cap open android        # ouvre Android Studio ; brancher le téléphone en USB puis Run ▶️
```

## Méthode de développement

Le projet est construit étape par étape (voir `docs/architecture.md` pour le détail).
Chaque domaine fonctionnel (auth, posts, votes, classement, duels, notifications,
modération) a son propre dossier de routes/contrôleurs côté backend, et son propre
dossier d'écrans côté frontend — rien n'est mélangé dans un seul fichier.
