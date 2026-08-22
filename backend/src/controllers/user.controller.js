import { prisma } from "../config/db.js";

/** GET /api/users/me — profil de l'utilisateur connecté */
export async function getMe(req, res, next) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        primaryTheme: true,
        _count: { select: { posts: true, followers: true, following: true } },
      },
    });
    if (!user) return res.status(404).json({ error: "Utilisateur introuvable." });
    const { passwordHash, ...safe } = user;
    res.json(safe);
  } catch (err) {
    next(err);
  }
}

/** GET /api/users/:username — profil public d'un autre utilisateur */
export async function getUserByUsername(req, res, next) {
  try {
    const user = await prisma.user.findUnique({
      where: { username: req.params.username },
      include: {
        primaryTheme: true,
        _count: { select: { posts: true, followers: true, following: true } },
      },
    });
    if (!user) return res.status(404).json({ error: "Utilisateur introuvable." });
    const { passwordHash, email, ...publicProfile } = user;
    res.json(publicProfile);
  } catch (err) {
    next(err);
  }
}

/** PATCH /api/users/me — modifier son profil */
export async function updateMe(req, res, next) {
  try {
    const { fullName, bio, country, avatarUrl, primaryThemeId } = req.body;
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: { fullName, bio, country, avatarUrl, primaryThemeId },
    });
    const { passwordHash, ...safe } = user;
    res.json(safe);
  } catch (err) {
    next(err);
  }
}

/** POST /api/users/:username/follow */
export async function followUser(req, res, next) {
  try {
    const target = await prisma.user.findUnique({ where: { username: req.params.username } });
    if (!target) return res.status(404).json({ error: "Utilisateur introuvable." });
    if (target.id === req.user.id) {
      return res.status(400).json({ error: "Impossible de se suivre soi-même." });
    }

    await prisma.follow.upsert({
      where: { followerId_followedId: { followerId: req.user.id, followedId: target.id } },
      update: {},
      create: { followerId: req.user.id, followedId: target.id },
    });

    await prisma.notification.create({
      data: {
        recipientId: target.id,
        type: "NEW_FOLLOWER",
        message: "a commencé à vous suivre.",
        relatedId: req.user.id,
      },
    });

    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

/** DELETE /api/users/:username/follow */
export async function unfollowUser(req, res, next) {
  try {
    const target = await prisma.user.findUnique({ where: { username: req.params.username } });
    if (!target) return res.status(404).json({ error: "Utilisateur introuvable." });

    await prisma.follow.deleteMany({
      where: { followerId: req.user.id, followedId: target.id },
    });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
