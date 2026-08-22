import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { voteRateLimiter } from "../middleware/rateLimiters.js";
import { voteOnPost, voteOnDuel } from "../controllers/vote.controller.js";

const router = Router();

router.post("/posts", requireAuth, voteRateLimiter, voteOnPost);
router.post("/duels", requireAuth, voteRateLimiter, voteOnDuel);

export default router;
