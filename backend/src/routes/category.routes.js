import { Router } from "express";
import { prisma } from "../config/db.js";

const router = Router();

/** GET /api/categories — liste des 13 thèmes officiels */
router.get("/", async (req, res, next) => {
  try {
    const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });
    res.json(categories);
  } catch (err) {
    next(err);
  }
});

export default router;
