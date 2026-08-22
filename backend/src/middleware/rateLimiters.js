import rateLimit from "express-rate-limit";

// Limite générale : protège toute l'API contre le spam de requêtes.
export const globalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Trop de requêtes, réessaie plus tard." },
});

// Limite stricte sur les votes : cœur de l'anti-fraude du système de compétition.
export const voteRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Trop de votes en peu de temps, réessaie dans une minute." },
});

// Limite sur les tentatives de connexion : anti brute-force.
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Trop de tentatives de connexion, réessaie plus tard." },
});
