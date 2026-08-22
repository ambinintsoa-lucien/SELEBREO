# Tester SELEBREO sur un téléphone Android réel (réseau local)

## 1. PostgreSQL

```bash
docker compose up -d
```

## 2. Backend

```bash
cd backend
cp .env.example .env
npm install
npx prisma migrate dev --name init
npm run prisma:seed      # crée les 13 thèmes officiels
npm run dev
```

## 3. Trouver l'IP locale du PC

- Windows : `ipconfig` → chercher "Adresse IPv4" (ex. `192.168.1.42`)
- Mac/Linux : `ifconfig` ou `ip addr`

## 4. Configurer le frontend pour pointer vers cette IP

```bash
cd frontend
cp .env.example .env
```
Éditer `.env` :
```
VITE_API_URL="http://192.168.1.42:4000"
```

## 5. Build + Capacitor

```bash
npm install
npm run build
npx cap add android      # première fois seulement
npx cap sync android
npx cap open android
```

## 6. Dans Android Studio

- Brancher le téléphone en USB, activer le mode développeur + débogage USB.
- Cliquer **Run ▶️** — l'app s'installe et se lance directement sur le téléphone,
  connectée au backend qui tourne sur le PC (même réseau Wi-Fi requis).

## Points d'attention

- `capacitor.config.ts` a `cleartext: true` pour autoriser le `http://` en dev —
  à retirer avant une build de production pointant vers une API en `https://`.
- Si le téléphone ne peut pas joindre l'API : vérifier que le pare-feu Windows
  n'bloque pas le port 4000 en connexions entrantes.
