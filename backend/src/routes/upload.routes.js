import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import {
  uploadVideo,
  uploadAvatar,
} from "../config/upload.js";
import { supabase } from "../config/supabase.js";
import fs from "node:fs/promises";

const router = Router();

/* =========================
   UPLOAD VIDÉO
   ========================= */

router.post(
  "/video",
  requireAuth,
  uploadVideo.single("video"),
  async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          error: "Aucune vidéo reçue.",
        });
      }

      // Chemin dans le bucket Supabase "videos"
      const filePath = `uploads/${req.file.filename}`;

      // Lire le fichier temporaire créé par Multer
      const fileBuffer = await fs.readFile(req.file.path);

      // Envoyer vers Supabase Storage
      const { error } = await supabase.storage
        .from("videos")
        .upload(filePath, fileBuffer, {
          contentType: req.file.mimetype,
          upsert: false,
        });

      // Supprimer le fichier temporaire de Render
      await fs.unlink(req.file.path).catch(() => { });

      if (error) {
        console.error(
          "Erreur stockage Supabase vidéo :",
          error
        );

        return res.status(500).json({
          error: "Échec de l'envoi de vidéo vers Supabase.",
          details: error.message,
          code: error.code,
        });
      }

      // Générer l'URL publique Supabase
      const { data } = supabase.storage
        .from("videos")
        .getPublicUrl(filePath);

      if (!data?.publicUrl) {
        return res.status(500).json({
          error: "URL publique de la vidéo impossible à générer.",
        });
      }

      return res.status(201).json({
        url: data.publicUrl,
      });
    } catch (err) {
      next(err);
    }
  }
);


/* =========================
   UPLOAD AVATAR
   ========================= */

router.post(
  "/avatar",
  requireAuth,
  uploadAvatar.single("avatar"),
  async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          error: "Aucune image reçue.",
        });
      }

      // Chemin dans le bucket Supabase "avatars"
      const filePath = `uploads/${req.file.filename}`;

      // Lire le fichier temporaire créé par Multer
      const fileBuffer = await fs.readFile(req.file.path);

      // Envoyer vers Supabase Storage
      const { error } = await supabase.storage
        .from("avatars")
        .upload(filePath, fileBuffer, {
          contentType: req.file.mimetype,
          upsert: false,
        });

      // Supprimer le fichier temporaire de Render
      await fs.unlink(req.file.path).catch(() => { });

      if (error) {
        console.error(
          "Erreur stockage Supabase avatar :",
          error
        );

        return res.status(500).json({
          error: "Échec de l'envoi de l'avatar vers Supabase.",
          details: error.message,
          code: error.code,
        });
      }

      // Générer l'URL publique Supabase
      const { data } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      if (!data?.publicUrl) {
        return res.status(500).json({
          error: "URL publique de l'avatar impossible à générer.",
        });
      }

      return res.status(201).json({
        url: data.publicUrl,
      });
    } catch (err) {
      next(err);
    }
  }
);


/* =========================
   GESTION DES ERREURS
   ========================= */

router.use((err, req, res, next) => {
  console.error("Erreur upload :", err);

  return res.status(400).json({
    error: err.message || "Échec de l'upload.",
  });
});

export default router;