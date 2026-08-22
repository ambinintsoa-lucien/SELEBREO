import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import {
  listPosts,
  getPost,
  createPost,
  deletePost,
  likePost,
  unlikePost,
  addComment,
  listComments,
} from "../controllers/post.controller.js";

const router = Router();

router.get("/", listPosts);
router.get("/:id", getPost);
router.post("/", requireAuth, createPost);
router.delete("/:id", requireAuth, deletePost);

router.post("/:id/like", requireAuth, likePost);
router.delete("/:id/like", requireAuth, unlikePost);

router.get("/:id/comments", listComments);
router.post("/:id/comments", requireAuth, addComment);

export default router;
