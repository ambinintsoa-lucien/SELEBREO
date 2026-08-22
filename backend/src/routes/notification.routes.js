import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { listNotifications, markAsRead, markAllAsRead } from "../controllers/notification.controller.js";

const router = Router();

router.get("/", requireAuth, listNotifications);
router.patch("/:id/read", requireAuth, markAsRead);
router.patch("/read-all", requireAuth, markAllAsRead);

export default router;
