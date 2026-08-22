/**
 * Gestionnaire d'erreurs centralisé. Toujours placé en dernier
 * dans la chaîne de middlewares (voir app.js).
 */
export function errorHandler(err, req, res, next) {
  console.error(err);

  if (err.name === "ZodError") {
    return res.status(400).json({ error: "Données invalides.", details: err.errors });
  }

  const status = err.status || 500;
  const message = status === 500 ? "Erreur interne du serveur." : err.message;
  res.status(status).json({ error: message });
}

export function notFoundHandler(req, res) {
  res.status(404).json({ error: "Route non trouvée." });
}
