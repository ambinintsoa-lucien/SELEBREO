import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { createReport, listReports, resolveReport } from "../controllers/report.controller.js";

const router = Router();

router.post("/", requireAuth, createReport);
router.get("/", requireAuth, requireRole("ADMIN", "MODERATOR"), listReports);
router.patch("/:id", requireAuth, requireRole("ADMIN", "MODERATOR"), resolveReport);

export default router;
