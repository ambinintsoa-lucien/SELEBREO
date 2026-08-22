import { z } from "zod";
import { prisma } from "../config/db.js";

/** GET /api/posts — fil d'actualité (paginé) */
export async function listPosts(req, res, next) {
  try {
    const take = Math.min(Number(req.query.limit) || 10, 50);
    const cursor = req.query.cursor;

    const posts = await prisma.post.findMany({
      take,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
      orderBy: { createdAt: "desc" },
      where: { visibility: "PUBLIC" },
      include: {
        author: { select: { id: true, username: true, avatarUrl: true } },
        category: true,
        _count: { select: { likes: true, comments: true, votes: true } },
      },
    });

    res.json({
      posts,
      nextCursor: posts.length === take ? posts[posts.length - 1].id : null,
    });
  } catch (err) {
    next(err);
  }
}

/** GET /api/posts/:id */
export async function getPost(req, res, next) {
  try {
    const post = await prisma.post.findUnique({
      where: { id: req.params.id },
      include: {
        author: { select: { id: true, username: true, avatarUrl: true } },
        category: true,
        _count: { select: { likes: true, comments: true, votes: true } },
      },
    });
    if (!post) return res.status(404).json({ error: "Publication introuvable." });
    res.json(post);
  } catch (err) {
    next(err);
  }
}

const createPostSchema = z.object({
  videoUrl: z.string().url(),
  thumbnailUrl: z.string().url().optional(),
  description: z.string().max(220),
  hashtags: z.array(z.string()).max(10).optional().default([]),
  categoryId: z.string().uuid(),
  visibility: z.enum(["PUBLIC", "FOLLOWERS_ONLY", "PRIVATE"]).optional().default("PUBLIC"),
});

/** POST /api/posts — publication vidéo + description uniquement (pas de photo/texte) */
export async function createPost(req, res, next) {
  try {
    const data = createPostSchema.parse(req.body);
    const post = await prisma.post.create({
      data: { ...data, authorId: req.user.id },
    });
    res.status(201).json(post);
  } catch (err) {
    next(err);
  }
}

/** DELETE /api/posts/:id */
export async function deletePost(req, res, next) {
  try {
    const post = await prisma.post.findUnique({ where: { id: req.params.id } });
    if (!post) return res.status(404).json({ error: "Publication introuvable." });
    if (post.authorId !== req.user.id && req.user.role === "USER") {
      return res.status(403).json({ error: "Action non autorisée." });
    }
    await prisma.post.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

/** POST /api/posts/:id/like */
export async function likePost(req, res, next) {
  try {
    const post = await prisma.post.findUnique({ where: { id: req.params.id } });
    if (!post) return res.status(404).json({ error: "Publication introuvable." });

    await prisma.like.upsert({
      where: { userId_postId: { userId: req.user.id, postId: post.id } },
      update: {},
      create: { userId: req.user.id, postId: post.id },
    });

    if (post.authorId !== req.user.id) {
      await prisma.notification.create({
        data: {
          recipientId: post.authorId,
          type: "LIKE",
          message: "a aimé votre publication.",
          relatedId: post.id,
        },
      });
    }
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

/** DELETE /api/posts/:id/like */
export async function unlikePost(req, res, next) {
  try {
    await prisma.like.deleteMany({ where: { userId: req.user.id, postId: req.params.id } });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

const commentSchema = z.object({
  content: z.string().min(1).max(500),
});

/** POST /api/posts/:id/comments */
export async function addComment(req, res, next) {
  try {
    const { content } = commentSchema.parse(req.body);
    const post = await prisma.post.findUnique({ where: { id: req.params.id } });
    if (!post) return res.status(404).json({ error: "Publication introuvable." });

    const comment = await prisma.comment.create({
      data: { content, userId: req.user.id, postId: post.id },
      include: { user: { select: { id: true, username: true, avatarUrl: true } } },
    });

    if (post.authorId !== req.user.id) {
      await prisma.notification.create({
        data: {
          recipientId: post.authorId,
          type: "COMMENT",
          message: `a commenté : "${content.slice(0, 50)}"`,
          relatedId: post.id,
        },
      });
    }

    res.status(201).json(comment);
  } catch (err) {
    next(err);
  }
}

/** GET /api/posts/:id/comments */
export async function listComments(req, res, next) {
  try {
    const comments = await prisma.comment.findMany({
      where: { postId: req.params.id },
      orderBy: { createdAt: "desc" },
      include: { user: { select: { id: true, username: true, avatarUrl: true } } },
    });
    res.json(comments);
  } catch (err) {
    next(err);
  }
}
