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

      const filePath = req.file.filename;
      const fileBuffer = await fs.readFile(req.file.path);

      const { error } = await supabase.storage
        .from("videos")
        .upload(filePath, fileBuffer, {
          contentType: req.file.mimetype,
          upsert: false,
        });

      await fs.unlink(req.file.path).catch(() => { });

      if (error) {
        console.error("Erreur stockage Supabase vidéo :", error);

        return res.status(500).json({
          error: "Échec de l'envoi de vidéo vers Supabase.",
          details: error.message,
        });
      }

      const { data } = supabase.storage
        .from("videos")
        .getPublicUrl(filePath);

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

      const filePath = req.file.filename;
      const fileBuffer = await fs.readFile(req.file.path);

      const { error } = await supabase.storage
        .from("avatars")
        .upload(filePath, fileBuffer, {
          contentType: req.file.mimetype,
          upsert: false,
        });

      await fs.unlink(req.file.path).catch(() => { });

      if (error) {
        console.error("Erreur stockage Supabase avatar :", error);

        return res.status(500).json({
          error: "Échec de l'envoi de l'avatar vers Supabase.",
          details: error.message,
        });
      }

      const { data } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

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