import crypto from "node:crypto";
import { z } from "zod";
import { prisma } from "../config/db.js";

function hashIp(ip) {
  return crypto
    .createHash("sha256")
    .update(String(ip))
    .digest("hex");
}

const voteOnPostSchema = z.object({
  postId: z.string().uuid(),
});

/**
 * Vote classique sur une publication.
 *
 * Règle SELEBREO :
 * - 1 utilisateur = 1 vote par publication
 * - 1 vote = +1 point pour l'auteur
 * - le like est totalement indépendant du classement
 */
export async function voteOnPost(req, res, next) {
  try {
    const { postId } = voteOnPostSchema.parse(req.body);

    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return res.status(404).json({
        error: "Publication introuvable.",
      });
    }

    if (post.authorId === req.user.id) {
      return res.status(400).json({
        error: "Impossible de voter pour sa propre publication.",
      });
    }

    /*
     * Vérification rapide avant création.
     * La contrainte @@unique([voterId, postId])
     * protège également contre deux requêtes simultanées.
     */
    const existingVote = await prisma.vote.findUnique({
      where: {
        voterId_postId: {
          voterId: req.user.id,
          postId,
        },
      },
    });

    if (existingVote) {
      return res.status(409).json({
        error: "Vous avez déjà voté pour cette publication.",
      });
    }

    /*
     * On crée le vote ET on ajoute exactement 1 point
     * à l'auteur dans RankingEntry.
     *
     * Le LIKE n'intervient absolument pas ici.
     */
    const result = await prisma.$transaction(async (tx) => {
      const vote = await tx.vote.create({
        data: {
          voterId: req.user.id,
          postId,
          type: "LIKE_BOOST",
          ipHash: hashIp(req.ip),
          deviceHash: req.headers["x-device-id"]
            ? String(req.headers["x-device-id"])
            : null,
        },
      });

      /*
       * Récupérer la période active.
       */
      const period = await tx.competitionPeriod.findFirst({
        where: {
          isActive: true,
        },
        orderBy: {
          startedAt: "desc",
        },
      });

      /*
       * S'il n'y a pas encore de compétition,
       * le vote reste enregistré mais aucun score
       * de classement ne peut être ajouté.
       */
      if (!period) {
        return {
          vote,
          scoreUpdated: false,
        };
      }

      /*
       * Trouver l'entrée de classement de l'auteur.
       */
      const rankingEntry = await tx.rankingEntry.findUnique({
        where: {
          periodId_userId: {
            periodId: period.id,
            userId: post.authorId,
          },
        },
      });

      /*
       * Si l'utilisateur n'a pas encore d'entrée,
       * on la crée dans le palier actuellement actif.
       */
      if (!rankingEntry) {
        const currentStage = await tx.competitionStage.findFirst({
          where: {
            periodId: period.id,
            endedAt: null,
          },
          orderBy: {
            order: "desc",
          },
        });

        if (currentStage) {
          await tx.rankingEntry.create({
            data: {
              periodId: period.id,
              stageId: currentStage.id,
              userId: post.authorId,
              totalScore: 1,
              position: null,
              isEliminated: false,
            },
          });
        }
      } else if (!rankingEntry.isEliminated) {
        /*
         * +1 uniquement pour le vote.
         *
         * IMPORTANT :
         * aucun calcul de likes ici.
         */
        await tx.rankingEntry.update({
          where: {
            id: rankingEntry.id,
          },
          data: {
            totalScore: {
              increment: 1,
            },
          },
        });
      }

      return {
        vote,
        scoreUpdated: true,
      };
    });

    return res.status(201).json(result);
  } catch (err) {
    /*
     * Protection supplémentaire contre une double requête
     * qui arriverait exactement au même moment.
     */
    if (err.code === "P2002") {
      return res.status(409).json({
        error: "Vous avez déjà voté pour cette publication.",
      });
    }

    next(err);
  }
}


const voteOnDuelSchema = z.object({
  duelId: z.string().uuid(),
  votedForUserId: z.string().uuid(),
});


/**
 * Vote pendant un duel.
 *
 * Règle :
 * - 1 utilisateur = 1 vote par duel
 * - le vote est attribué à l'un des deux participants
 */
export async function voteOnDuel(req, res, next) {
  try {
    const { duelId, votedForUserId } =
      voteOnDuelSchema.parse(req.body);

    const duel = await prisma.duel.findUnique({
      where: { id: duelId },
    });

    if (!duel) {
      return res.status(404).json({
        error: "Duel introuvable.",
      });
    }

    if (duel.status !== "ONGOING") {
      return res.status(400).json({
        error: "Ce duel n'est plus ouvert au vote.",
      });
    }

    if (new Date() > duel.votingEndsAt) {
      return res.status(400).json({
        error: "La période de vote est terminée.",
      });
    }

    if (
      ![
        duel.participantAId,
        duel.participantBId,
      ].includes(votedForUserId)
    ) {
      return res.status(400).json({
        error: "Ce participant ne fait pas partie de ce duel.",
      });
    }

    try {
      const vote = await prisma.vote.create({
        data: {
          voterId: req.user.id,
          duelId,
          votedForUserId,
          type: "DUEL",
          ipHash: hashIp(req.ip),
          deviceHash: req.headers["x-device-id"]
            ? String(req.headers["x-device-id"])
            : null,
        },
      });

      return res.status(201).json(vote);
    } catch (err) {
      if (err.code === "P2002") {
        return res.status(409).json({
          error: "Vous avez déjà voté pour ce duel.",
        });
      }

      throw err;
    }
  } catch (err) {
    next(err);
  }
}