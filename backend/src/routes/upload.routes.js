import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import {
  uploadVideo,
  uploadAvatar,
} from "../config/upload.js";

const router = Router();

/* =========================
   UPLOAD VIDÉO
   ========================= */

router.post(
  "/video",
  requireAuth,
  uploadVideo.single("video"),
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({
        error: "Aucun fichier vidéo reçu.",
      });
    }

    const url =
      `${req.protocol}://${req.get("host")}/uploads/videos/${req.file.filename}`;

    res.status(201).json({ url });
  }
);


/* =========================
   UPLOAD PHOTO DE PROFIL
   ========================= */

router.post(
  "/avatar",
  requireAuth,
  uploadAvatar.single("avatar"),
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({
        error: "Aucune image reçue.",
      });
    }

    const url =
      `${req.protocol}://${req.get("host")}/uploads/avatars/${req.file.filename}`;

    res.status(201).json({ url });
  }
);


/* =========================
   GESTION DES ERREURS
   ========================= */

router.use((err, req, res, next) => {
  if (err) {
    return res.status(400).json({
      error: err.message || "Échec de l'upload.",
    });
  }

  next();
});

export default router;