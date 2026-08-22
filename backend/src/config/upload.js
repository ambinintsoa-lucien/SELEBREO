import multer from "multer";
import path from "node:path";
import fs from "node:fs";
import crypto from "node:crypto";

/* =========================================================
   UPLOAD VIDÉOS
   ========================================================= */

const UPLOAD_DIR = path.resolve("uploads/videos");

fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const ALLOWED_MIME_TYPES = [
  "video/mp4",
  "video/quicktime",
  "video/webm",
  "video/3gpp",
];

const MAX_SIZE_BYTES = 100 * 1024 * 1024; // 100 Mo

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },

  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || ".mp4";

    const safeName =
      `${Date.now()}_${crypto.randomBytes(8).toString("hex")}${ext}`;

    cb(null, safeName);
  },
});

function fileFilter(req, file, cb) {
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    return cb(
      new Error(
        "Format vidéo non supporté (mp4, mov, webm, 3gp uniquement)."
      )
    );
  }

  cb(null, true);
}

export const uploadVideo = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_SIZE_BYTES,
  },
});


/* =========================================================
   UPLOAD PHOTO DE PROFIL
   ========================================================= */

const AVATAR_UPLOAD_DIR = path.resolve("uploads/avatars");

fs.mkdirSync(AVATAR_UPLOAD_DIR, { recursive: true });

const ALLOWED_AVATAR_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

const MAX_AVATAR_SIZE = 5 * 1024 * 1024; // 5 Mo

const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, AVATAR_UPLOAD_DIR);
  },

  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || ".jpg";

    const safeName =
      `${Date.now()}_${crypto.randomBytes(8).toString("hex")}${ext}`;

    cb(null, safeName);
  },
});

function avatarFileFilter(req, file, cb) {
  if (!ALLOWED_AVATAR_TYPES.includes(file.mimetype)) {
    return cb(
      new Error(
        "Format d'image non supporté. Utilisez JPG, PNG, WEBP ou GIF."
      )
    );
  }

  cb(null, true);
}

export const uploadAvatar = multer({
  storage: avatarStorage,

  fileFilter: avatarFileFilter,

  limits: {
    fileSize: MAX_AVATAR_SIZE,
  },
});