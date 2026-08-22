import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { listActiveDuels, getDuel, resolveDuel } from "../controllers/duel.controller.js";

const router = Router();

router.get("/active", listActiveDuels);
router.get("/:id", getDuel);
router.post("/:id/resolve", requireAuth, requireRole("ADMIN", "MODERATOR"), resolveDuel);

export default router;
