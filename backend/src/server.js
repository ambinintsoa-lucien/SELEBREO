import "dotenv/config";
import { app } from "./app.js";
import { scheduleRankingJob } from "./jobs/ranking.job.js";
import { initRanking } from "./scripts/init-ranking.js";
import { prisma } from "./config/db.js";

const PORT = process.env.PORT || 4000;

app.listen(PORT, "0.0.0.0", async () => {
  console.log(`SELEBREO backend en écoute sur le port ${PORT}`);

  try {
    await initRanking();
    console.log("Classement SELEBREO prêt.");
  } catch (error) {
    console.error(
      "Erreur lors de l'initialisation du classement :",
      error
    );
  }

  scheduleRankingJob();
});