import { z } from "zod";
import { prisma } from "../config/db.js";

const reportSchema = z.object({
  reason: z.enum(["SPAM", "HARASSMENT", "HATE_SPEECH", "NUDITY", "VIOLENCE", "FALSE_INFORMATION", "OTHER"]),
  details: z.string().max(500).optional(),
  postId: z.string().uuid().optional(),
  commentId: z.string().uuid().optional(),
  reportedUserId: z.string().uuid().optional(),
});

/** POST /api/reports — signaler une publication, un commentaire ou un utilisateur */
export async function createReport(req, res, next) {
  try {
    const data = reportSchema.parse(req.body);
    if (!data.postId && !data.commentId && !data.reportedUserId) {
      return res.status(400).json({ error: "Aucune cible de signalement fournie." });
    }

    const report = await prisma.report.create({
      data: { ...data, reportedById: req.user.id },
    });
    res.status(201).json(report);
  } catch (err) {
    next(err);
  }
}

/** GET /api/reports — réservé aux admins/modérateurs */
export async function listReports(req, res, next) {
  try {
    const reports = await prisma.report.findMany({
      where: req.query.status ? { status: req.query.status } : undefined,
      orderBy: { createdAt: "desc" },
      include: {
        reportedBy: { select: { id: true, username: true } },
        post: true,
        comment: true,
        reportedUser: { select: { id: true, username: true } },
      },
    });
    res.json(reports);
  } catch (err) {
    next(err);
  }
}

/** PATCH /api/reports/:id — traiter un signalement (admin/modérateur) */
export async function resolveReport(req, res, next) {
  try {
    const { status } = req.body; // REVIEWED_ACCEPTED | REVIEWED_REJECTED
    const report = await prisma.report.update({
      where: { id: req.params.id },
      data: { status },
    });

    await prisma.adminAction.create({
      data: {
        adminId: req.user.id,
        type: "RESOLVE_REPORT",
        targetId: report.id,
        details: `status=${status}`,
      },
    });

    res.json(report);
  } catch (err) {
    next(err);
  }
}
