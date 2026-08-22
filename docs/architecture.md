# Architecture SELEBREO

## Décisions actées

- **Frontend :** React (Vite), packagé en app Android via **Capacitor**.
- **Backend :** Node.js + Express, ORM **Prisma**.
- **Base de données :** PostgreSQL.
- **Auth :** JWT (access + refresh) + bcrypt pour les mots de passe (jamais en clair).
- **Stockage vidéo :** S3 ou compatible (à configurer, non branché dans ce scaffold).
- **Tâches planifiées :** node-cron, calcul automatique du classement chaque nuit
  (le palier ne progresse réellement que si son délai est écoulé — délais lus
  depuis `CompetitionPeriod`, donc réglables par un admin sans toucher au code).

## Mécanique de compétition

- Progression : TOP_100 → TOP_80 → TOP_40 → TOP_20 → TOP_10 → TOP_4 → TOP_2 → FINALE → TOP_1
- Score **cumulatif** sur tout le cycle (jamais remis à zéro entre paliers).
- Calendrier : TOP_100 atteint après 7 jours, puis un palier tous les 30 jours.
- Anti-fraude votes : contrainte unique `(voterId, duelId)` en base (1 vote/user/duel),
  rate limiting dédié (10 votes/minute), IP hashée (jamais en clair) et empreinte
  device optionnelle journalisées pour la détection d'anomalies côté admin.
- Vote SMS : non développé, mais le champ `type` sur `Vote` (LIKE_BOOST | DUEL)
  est prévu pour accueillir un futur type `SMS` sans migration structurelle lourde.

## Pas encore implémenté (prochaines étapes)

- Upload vidéo réel vers S3 (le champ `videoUrl` attend une URL déjà hébergée).
- OAuth2 Google/Facebook (les icônes sont visuelles pour l'instant, non branchées).
- Notifications push (Firebase) — non intégrées dans ce scaffold.
- Interface d'administration (panel séparé, web).
- Écrans détaillés : Post Detail complet avec commentaires en direct, Post Preview,
  Résultat du duel, Modifier le profil (formulaire dédié), Utilisateurs bloqués
  (UI, l'API existe déjà), Sécurité, Suppression du compte, Règles communautaires.
- Job de résolution automatique des duels à l'expiration du vote (actuellement
  déclenché manuellement par un admin via `POST /api/duels/:id/resolve`).

## Pourquoi Prisma plutôt que Sequelize

Migrations versionnées lisibles, typage généré automatiquement (utile même en JS
via l'autocomplétion), et une syntaxe de schéma qui reste proche de `database/schema.sql`
pour qu'un humain puisse comparer les deux facilement.
