import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { getCurrentRanking, getMyRanking } from "../controllers/ranking.controller.js";

const router = Router();

router.get("/current", getCurrentRanking);
router.get("/me", requireAuth, getMyRanking);

export default router;
