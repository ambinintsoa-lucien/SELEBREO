import "dotenv/config";
import { app } from "./app.js";
import { scheduleRankingJob } from "./jobs/ranking.job.js";

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`SELEBREO backend en écoute sur http://localhost:${PORT}`);
  scheduleRankingJob();
});
