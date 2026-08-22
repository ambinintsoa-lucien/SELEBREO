import { prisma } from "../config/db.js";

/** GET /api/ranking/current — classement du palier actif */
export async function getCurrentRanking(req, res, next) {
  try {
    const period = await prisma.competitionPeriod.findFirst({
      where: { isActive: true },
      orderBy: { startedAt: "desc" },
    });

    if (!period) {
      return res.json({
        period: null,
        stage: null,
        entries: [],
      });
    }

    const stage = await prisma.competitionStage.findFirst({
      where: {
        periodId: period.id,
        endedAt: null,
      },
      orderBy: {
        order: "desc",
      },
    });

    if (!stage) {
      return res.json({
        period,
        stage: null,
        entries: [],
      });
    }

    const entries = await prisma.rankingEntry.findMany({
      where: {
        stageId: stage.id,
        isEliminated: false,
      },
      orderBy: [
        { totalScore: "desc" },
        { updatedAt: "asc" },
      ],
      take: 100,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
            primaryTheme: true,
          },
        },
      },
    });

    // Calcul de la position immédiatement à partir du score.
    const rankedEntries = entries.map((entry, index) => ({
      ...entry,
      position: index + 1,
    }));

    res.json({
      period,
      stage,
      entries: rankedEntries,
    });
  } catch (err) {
    next(err);
  }
}

/** GET /api/ranking/me — classement de l'utilisateur connecté */
export async function getMyRanking(req, res, next) {
  try {
    const period = await prisma.competitionPeriod.findFirst({
      where: { isActive: true },
    });

    if (!period) {
      return res.json(null);
    }

    const entry = await prisma.rankingEntry.findUnique({
      where: {
        periodId_userId: {
          periodId: period.id,
          userId: req.user.id,
        },
      },
      include: {
        stage: true,
      },
    });

    if (!entry) {
      return res.json(null);
    }

    // Calcul de la position actuelle parmi les participants actifs.
    const betterEntries = await prisma.rankingEntry.count({
      where: {
        stageId: entry.stageId,
        isEliminated: false,
        OR: [
          {
            totalScore: {
              gt: entry.totalScore,
            },
          },
          {
            totalScore: entry.totalScore,
            updatedAt: {
              lt: entry.updatedAt,
            },
          },
        ],
      },
    });

    res.json({
      ...entry,
      position: betterEntries + 1,
    });
  } catch (err) {
    next(err);
  }
}