import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import {
  getMe,
  getUserByUsername,
  updateMe,
  followUser,
  unfollowUser,
} from "../controllers/user.controller.js";

const router = Router();

router.get("/me", requireAuth, getMe);
router.patch("/me", requireAuth, updateMe);
router.get("/:username", getUserByUsername);
router.post("/:username/follow", requireAuth, followUser);
router.delete("/:username/follow", requireAuth, unfollowUser);

export default router;
