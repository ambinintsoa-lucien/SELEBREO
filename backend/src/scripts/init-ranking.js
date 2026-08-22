import { prisma } from "../config/db.js";

async function main() {
    console.log("Initialisation du classement SELEBREO...");

    // 1. Chercher une compétition active
    let period = await prisma.competitionPeriod.findFirst({
        where: { isActive: true },
        orderBy: { startedAt: "desc" },
    });

    // 2. Créer la compétition si elle n'existe pas
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

    // 3. Chercher le palier TOP_100
    let stage = await prisma.competitionStage.findFirst({
        where: {
            periodId: period.id,
            name: "TOP_100",
        },
    });

    // 4. Créer TOP_100 s'il n'existe pas
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

    // 5. Récupérer les utilisateurs actifs
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

    // 6. Créer leur entrée dans le classement
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

        console.log(`RankingEntry OK : ${user.username}`);
    }

    console.log("");
    console.log("=================================");
    console.log("CLASSEMENT INITIALISÉ");
    console.log("=================================");
    console.log("Saison :", period.label);
    console.log("TOP 100 :", stage.id);
    console.log("Utilisateurs :", users.length);
    console.log("=================================");
}

main()
    .catch((error) => {
        console.error("Erreur lors de l'initialisation :", error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });