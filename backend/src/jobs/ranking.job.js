import cron from "node-cron";
import { prisma } from "../config/db.js";

// Ordre des paliers, du plus large au plus restreint.
const STAGE_ORDER = ["TOP_100", "TOP_80", "TOP_40", "TOP_20", "TOP_10", "TOP_4", "TOP_2", "FINALE", "TOP_1"];
const STAGE_SIZE = {
  TOP_100: 100,
  TOP_80: 80,
  TOP_40: 40,
  TOP_20: 20,
  TOP_10: 10,
  TOP_4: 4,
  TOP_2: 2,
  FINALE: 2,
  TOP_1: 1,
};

/**
 * Fait progresser une période de compétition vers son prochain palier si le délai
 * est écoulé. Le score reste cumulatif (jamais remis à zéro) — voir décision produit.
 * Les délais (initialStageDelayDays / stageReductionDelayDays) sont lus depuis la
 * CompetitionPeriod elle-même, donc réglables par l'admin sans toucher au code.
 */
async function advanceStageIfDue(period) {
  const currentStage = await prisma.competitionStage.findFirst({
    where: { periodId: period.id, endedAt: null },
    orderBy: { order: "desc" },
  });

  const now = new Date();
  const currentIndex = currentStage ? STAGE_ORDER.indexOf(currentStage.name) : -1;

  const delayDays =
    currentIndex <= 0 ? period.initialStageDelayDays : period.stageReductionDelayDays;
  const referenceDate = currentStage ? currentStage.startedAt : period.startedAt;
  const dueDate = new Date(referenceDate);
  dueDate.setDate(dueDate.getDate() + delayDays);

  if (now < dueDate) return; // pas encore le moment

  const nextIndex = currentIndex + 1;
  if (nextIndex >= STAGE_ORDER.length) return; // déjà au dernier palier (TOP_1)

  const nextStageName = STAGE_ORDER[nextIndex];
  const nextStageSize = STAGE_SIZE[nextStageName];

  await prisma.$transaction(async (tx) => {
    if (currentStage) {
      await tx.competitionStage.update({ where: { id: currentStage.id }, data: { endedAt: now } });
    }

    const newStage = await tx.competitionStage.create({
      data: { periodId: period.id, name: nextStageName, order: nextIndex + 1 },
    });

    // Classement par score cumulatif décroissant, on ne garde que les N meilleurs.
    const ranked = await tx.rankingEntry.findMany({
      where: { periodId: period.id, isEliminated: false },
      orderBy: { totalScore: "desc" },
    });

    for (let i = 0; i < ranked.length; i++) {
      const entry = ranked[i];
      const qualifies = i < nextStageSize;

      await tx.rankingEntry.update({
        where: { id: entry.id },
        data: {
          stageId: newStage.id,
          position: i + 1,
          isEliminated: !qualifies,
        },
      });

      await tx.notification.create({
        data: {
          recipientId: entry.userId,
          type: qualifies ? "QUALIFICATION" : "ELIMINATION",
          message: qualifies
            ? `Félicitations, vous progressez au palier ${nextStageName} !`
            : `Vous avez été éliminé à ce palier. Merci d'avoir participé !`,
          relatedId: newStage.id,
        },
      });
    }
  });
}

/** À appeler une fois au démarrage du serveur pour programmer la tâche récurrente. */
export function scheduleRankingJob() {
  // Tous les jours à 3h du matin — le calcul lui-même ne fait progresser un palier
  // que si son délai (7 jours puis 30 jours) est effectivement écoulé.
  cron.schedule("0 3 * * *", async () => {
    try {
      const activePeriods = await prisma.competitionPeriod.findMany({ where: { isActive: true } });
      for (const period of activePeriods) {
        await advanceStageIfDue(period);
      }
    } catch (err) {
      console.error("[ranking.job] échec du calcul automatique du classement :", err);
    }
  });
}
