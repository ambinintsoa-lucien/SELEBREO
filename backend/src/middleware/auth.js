import { verifyToken } from "../utils/jwt.js";

/**
 * Vérifie le token JWT présent dans l'en-tête Authorization: Bearer <token>.
 * Attache req.user = { id, role } si valide, sinon 401.
 */
export function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Authentification requise." });
  }

  const token = header.slice("Bearer ".length);
  try {
    const payload = verifyToken(token);
    req.user = { id: payload.sub, role: payload.role };
    next();
  } catch {
    return res.status(401).json({ error: "Token invalide ou expiré." });
  }
}

/**
 * À utiliser après requireAuth. Restreint l'accès aux rôles listés.
 * Ex: requireRole("ADMIN", "MODERATOR")
 */
export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: "Accès refusé." });
    }
    next();
  };
}
