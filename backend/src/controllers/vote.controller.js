import crypto from "node:crypto";
import { z } from "zod";
import { prisma } from "../config/db.js";

function hashIp(ip) {
  // Ne jamais stocker l'IP en clair — seulement un hash, pour la détection d'anomalies.
  return crypto.createHash("sha256").update(String(ip)).digest("hex");
}

const voteOnPostSchema = z.object({
  postId: z.string().uuid(),
});

/** POST /api/votes/posts — vote "classique" sur une publication (période de classement) */
export async function voteOnPost(req, res, next) {
  try {
    const { postId } = voteOnPostSchema.parse(req.body);
    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) return res.status(404).json({ error: "Publication introuvable." });
    if (post.authorId === req.user.id) {
      return res.status(400).json({ error: "Impossible de voter pour sa propre publication." });
    }

    const vote = await prisma.vote.create({
      data: {
        voterId: req.user.id,
        postId,
        type: "LIKE_BOOST",
        ipHash: hashIp(req.ip),
        deviceHash: req.headers["x-device-id"] ? String(req.headers["x-device-id"]) : null,
      },
    });

    res.status(201).json(vote);
  } catch (err) {
    next(err);
  }
}

const voteOnDuelSchema = z.object({
  duelId: z.string().uuid(),
  votedForUserId: z.string().uuid(),
});

/** POST /api/votes/duels — vote lors d'un duel (1 vote par user par duel, contrainte @@unique en base) */
export async function voteOnDuel(req, res, next) {
  try {
    const { duelId, votedForUserId } = voteOnDuelSchema.parse(req.body);

    const duel = await prisma.duel.findUnique({ where: { id: duelId } });
    if (!duel) return res.status(404).json({ error: "Duel introuvable." });
    if (duel.status !== "ONGOING") {
      return res.status(400).json({ error: "Ce duel n'est plus ouvert au vote." });
    }
    if (new Date() > duel.votingEndsAt) {
      return res.status(400).json({ error: "La période de vote est terminée." });
    }
    if (![duel.participantAId, duel.participantBId].includes(votedForUserId)) {
      return res.status(400).json({ error: "Ce participant ne fait pas partie de ce duel." });
    }

    try {
      const vote = await prisma.vote.create({
        data: {
          voterId: req.user.id,
          duelId,
          votedForUserId,
          type: "DUEL",
          ipHash: hashIp(req.ip),
          deviceHash: req.headers["x-device-id"] ? String(req.headers["x-device-id"]) : null,
        },
      });
      res.status(201).json(vote);
    } catch (e) {
      // Violation de contrainte unique (voterId, duelId) = double vote détecté
      if (e.code === "P2002") {
        return res.status(409).json({ error: "Vous avez déjà voté pour ce duel." });
      }
      throw e;
    }
  } catch (err) {
    next(err);
  }
}
