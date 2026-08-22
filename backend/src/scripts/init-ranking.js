import { prisma } from "../config/db.js";

export async function initRanking() {
    console.log("Initialisation du classement SELEBREO...");

    let period = await prisma.competitionPeriod.findFirst({
        where: { isActive: true },
        orderBy: { startedAt: "desc" },
    });

    if (!period) {
        period = await prisma.competitionPeriod.create({
            data: {
                label: "Saison 1 - 2026",
                isActive: true,
                initialStageDelayDays: 7,
                stageReductionDelayDays: 30,
            },
        });

        console.log("CompetitionPeriod créée :", period.id);
    } else {
        console.log("CompetitionPeriod existante :", period.id);
    }

    let stage = await prisma.competitionStage.findFirst({
        where: {
            periodId: period.id,
            name: "TOP_100",
        },
    });

    if (!stage) {
        stage = await prisma.competitionStage.create({
            data: {
                periodId: period.id,
                name: "TOP_100",
                order: 1,
            },
        });

        console.log("Palier TOP_100 créé :", stage.id);
    } else {
        console.log("Palier TOP_100 existant :", stage.id);
    }

    const users = await prisma.user.findMany({
        where: {
            status: "ACTIVE",
        },
        select: {
            id: true,
            username: true,
        },
    });

    console.log("Utilisateurs actifs :", users.length);

    for (const user of users) {
        await prisma.rankingEntry.upsert({
            where: {
                periodId_userId: {
                    periodId: period.id,
                    userId: user.id,
                },
            },
            update: {
                stageId: stage.id,
                isEliminated: false,
            },
            create: {
                periodId: period.id,
                stageId: stage.id,
                userId: user.id,
                totalScore: 0,
                position: null,
                isEliminated: false,
            },
        });
    }

    console.log("Classement initialisé.");
}