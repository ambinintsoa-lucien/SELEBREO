import { prisma } from "../config/db.js";

/** GET /api/duels/active — duels en cours ouverts au vote */
export async function listActiveDuels(req, res, next) {
  try {
    const duels = await prisma.duel.findMany({
      where: { status: "ONGOING" },
      include: {
        participantA: { select: { id: true, username: true, avatarUrl: true, primaryTheme: true } },
        participantB: { select: { id: true, username: true, avatarUrl: true, primaryTheme: true } },
        stage: true,
        _count: { select: { votes: true } },
      },
      orderBy: { votingEndsAt: "asc" },
    });
    res.json(duels);
  } catch (err) {
    next(err);
  }
}

/** GET /api/duels/:id */
export async function getDuel(req, res, next) {
  try {
    const duel = await prisma.duel.findUnique({
      where: { id: req.params.id },
      include: {
        participantA: { select: { id: true, username: true, avatarUrl: true } },
        participantB: { select: { id: true, username: true, avatarUrl: true } },
        winner: { select: { id: true, username: true } },
        stage: true,
      },
    });
    if (!duel) return res.status(404).json({ error: "Duel introuvable." });
    res.json(duel);
  } catch (err) {
    next(err);
  }
}

/**
 * Détermine le gagnant d'un duel une fois la période de vote terminée.
 * Appelée soit par un job planifié (non détaillé ici), soit manuellement par un admin.
 */
export async function resolveDuel(req, res, next) {
  try {
    const duel = await prisma.duel.findUnique({ where: { id: req.params.id } });
    if (!duel) return res.status(404).json({ error: "Duel introuvable." });
    if (duel.status === "FINISHED") {
      return res.status(400).json({ error: "Ce duel est déjà résolu." });
    }
    if (new Date() < duel.votingEndsAt) {
      return res.status(400).json({ error: "La période de vote n'est pas encore terminée." });
    }

    const votesA = await prisma.vote.count({ where: { duelId: duel.id, votedForUserId: duel.participantAId } });
    const votesB = await prisma.vote.count({ where: { duelId: duel.id, votedForUserId: duel.participantBId } });
    const winnerId = votesA >= votesB ? duel.participantAId : duel.participantBId;

    const updated = await prisma.duel.update({
      where: { id: duel.id },
      data: { status: "FINISHED", winnerId },
    });

    await prisma.notification.createMany({
      data: [
        {
          recipientId: winnerId,
          type: "DUEL_RESULT",
          message: "Vous avez remporté votre duel !",
          relatedId: duel.id,
        },
        {
          recipientId: winnerId === duel.participantAId ? duel.participantBId : duel.participantAId,
          type: "DUEL_RESULT",
          message: "Vous avez perdu votre duel.",
          relatedId: duel.id,
        },
      ],
    });

    res.json(updated);
  } catch (err) {
    next(err);
  }
}
