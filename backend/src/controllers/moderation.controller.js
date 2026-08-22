import { prisma } from "../config/db.js";

/** POST /api/moderation/block/:username */
export async function blockUser(req, res, next) {
  try {
    const target = await prisma.user.findUnique({ where: { username: req.params.username } });
    if (!target) return res.status(404).json({ error: "Utilisateur introuvable." });
    if (target.id === req.user.id) {
      return res.status(400).json({ error: "Impossible de se bloquer soi-même." });
    }

    await prisma.blockedUser.upsert({
      where: { blockerId_blockedId: { blockerId: req.user.id, blockedId: target.id } },
      update: {},
      create: { blockerId: req.user.id, blockedId: target.id },
    });

    // On se désabonne mutuellement au blocage.
    await prisma.follow.deleteMany({
      where: {
        OR: [
          { followerId: req.user.id, followedId: target.id },
          { followerId: target.id, followedId: req.user.id },
        ],
      },
    });

    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

/** DELETE /api/moderation/block/:username */
export async function unblockUser(req, res, next) {
  try {
    const target = await prisma.user.findUnique({ where: { username: req.params.username } });
    if (!target) return res.status(404).json({ error: "Utilisateur introuvable." });

    await prisma.blockedUser.deleteMany({
      where: { blockerId: req.user.id, blockedId: target.id },
    });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

/** GET /api/moderation/blocked — liste des utilisateurs bloqués par soi-même */
export async function listBlockedUsers(req, res, next) {
  try {
    const blocked = await prisma.blockedUser.findMany({
      where: { blockerId: req.user.id },
      include: { blocked: { select: { id: true, username: true, avatarUrl: true } } },
    });
    res.json(blocked.map((b) => b.blocked));
  } catch (err) {
    next(err);
  }
}

/** PATCH /api/moderation/users/:id/suspend — admin uniquement */
export async function suspendUser(req, res, next) {
  try {
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { status: "SUSPENDED" },
    });

    await prisma.adminAction.create({
      data: { adminId: req.user.id, type: "SUSPEND_USER", targetId: user.id },
    });

    res.json({ id: user.id, status: user.status });
  } catch (err) {
    next(err);
  }
}
