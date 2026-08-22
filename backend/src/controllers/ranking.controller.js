import { prisma } from "../config/db.js";

/** GET /api/ranking/current — classement du palier actif de la période en cours */
export async function getCurrentRanking(req, res, next) {
  try {
    const period = await prisma.competitionPeriod.findFirst({
      where: { isActive: true },
      orderBy: { startedAt: "desc" },
    });
    if (!period) return res.json({ period: null, stage: null, entries: [] });

    const stage = await prisma.competitionStage.findFirst({
      where: { periodId: period.id, endedAt: null },
      orderBy: { order: "desc" },
    });
    if (!stage) return res.json({ period, stage: null, entries: [] });

    const entries = await prisma.rankingEntry.findMany({
      where: { stageId: stage.id, isEliminated: false },
      orderBy: { totalScore: "desc" },
      take: 100,
      include: {
        user: { select: { id: true, username: true, avatarUrl: true, primaryTheme: true } },
      },
    });

    res.json({ period, stage, entries });
  } catch (err) {
    next(err);
  }
}

/** GET /api/ranking/me — position de l'utilisateur connecté dans le palier actif */
export async function getMyRanking(req, res, next) {
  try {
    const period = await prisma.competitionPeriod.findFirst({ where: { isActive: true } });
    if (!period) return res.json(null);

    const entry = await prisma.rankingEntry.findUnique({
      where: { periodId_userId: { periodId: period.id, userId: req.user.id } },
      include: { stage: true },
    });
    res.json(entry);
  } catch (err) {
    next(err);
  }
}
