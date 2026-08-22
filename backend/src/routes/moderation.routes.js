import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import {
  blockUser,
  unblockUser,
  listBlockedUsers,
  suspendUser,
} from "../controllers/moderation.controller.js";

const router = Router();

router.get("/blocked", requireAuth, listBlockedUsers);
router.post("/block/:username", requireAuth, blockUser);
router.delete("/block/:username", requireAuth, unblockUser);

router.patch("/users/:id/suspend", requireAuth, requireRole("ADMIN"), suspendUser);

export default router;
