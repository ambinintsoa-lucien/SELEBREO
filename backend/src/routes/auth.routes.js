import { Router } from "express";

import {
    register,
    login,
    refresh,
} from "../controllers/auth.controller.js";

import { authRateLimiter } from "../middleware/rateLimiters.js";

const router = Router();

router.post("/register", authRateLimiter, register);

router.post("/login", authRateLimiter, login);

router.post("/refresh", authRateLimiter, refresh);

export default router;