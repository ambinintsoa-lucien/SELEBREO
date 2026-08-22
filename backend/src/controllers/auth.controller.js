import { z } from "zod";
import { prisma } from "../config/db.js";
import { hashPassword, comparePassword } from "../utils/password.js";
import {
  signAccessToken,
  signRefreshToken,
  verifyToken,
} from "../utils/jwt.js";

const registerSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_.]+$/, "Caractères non autorisés dans le nom d'utilisateur."),
  password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères."),
  fullName: z.string().max(150).optional(),
});

export async function register(req, res, next) {
  try {
    const data = registerSchema.parse(req.body);

    const existing = await prisma.user.findFirst({
      where: { OR: [{ email: data.email }, { username: data.username }] },
    });
    if (existing) {
      return res.status(409).json({ error: "Email ou nom d'utilisateur déjà utilisé." });
    }

    const passwordHash = await hashPassword(data.password);
    const user = await prisma.user.create({
      data: {
        email: data.email,
        username: data.username,
        passwordHash,
        fullName: data.fullName,
      },
    });

    const accessToken = signAccessToken({ sub: user.id, role: user.role });
    const refreshToken = signRefreshToken({ sub: user.id, role: user.role });

    res.status(201).json({
      user: publicUser(user),
      accessToken,
      refreshToken,
    });
  } catch (err) {
    next(err);
  }
}

const loginSchema = z.object({
  emailOrUsername: z.string().min(1),
  password: z.string().min(1),
});

export async function login(req, res, next) {
  try {
    const data = loginSchema.parse(req.body);

    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: data.emailOrUsername }, { username: data.emailOrUsername }],
      },
    });

    // Message volontairement générique (ne pas révéler si l'email existe ou non)
    const invalidCredentials = () => res.status(401).json({ error: "Identifiants invalides." });

    if (!user) return invalidCredentials();
    if (user.status === "SUSPENDED") {
      return res.status(403).json({ error: "Ce compte a été suspendu." });
    }

    const validPassword = await comparePassword(data.password, user.passwordHash);
    if (!validPassword) return invalidCredentials();

    const accessToken = signAccessToken({ sub: user.id, role: user.role });
    const refreshToken = signRefreshToken({ sub: user.id, role: user.role });


    res.json({
      user: publicUser(user),
      accessToken,
      refreshToken,
    });
  } catch (err) {
    next(err);
  }
}



export async function refresh(req, res, next) {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        error: "Refresh token requis.",
      });
    }

    const payload = verifyToken(refreshToken);

    if (!payload?.sub) {
      return res.status(401).json({
        error: "Refresh token invalide.",
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user) {
      return res.status(401).json({
        error: "Utilisateur introuvable.",
      });
    }

    if (user.status === "SUSPENDED") {
      return res.status(403).json({
        error: "Ce compte a été suspendu.",
      });
    }

    const accessToken = signAccessToken({
      sub: user.id,
      role: user.role,
    });

    res.json({
      accessToken,
    });
  } catch (err) {
    next(err);
  }
}

/** Ne renvoie jamais passwordHash ni d'autres champs sensibles au client. */
function publicUser(user) {
  const { passwordHash, ...safe } = user;
  return safe;
}
