import { prisma } from "../config/db.js";

/** GET /api/notifications — liste des notifications de l'utilisateur connecté */
export async function listNotifications(req, res, next) {
  try {
    const notifications = await prisma.notification.findMany({
      where: { recipientId: req.user.id },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    res.json(notifications);
  } catch (err) {
    next(err);
  }
}

/** PATCH /api/notifications/:id/read */
export async function markAsRead(req, res, next) {
  try {
    const notification = await prisma.notification.findUnique({ where: { id: req.params.id } });
    if (!notification || notification.recipientId !== req.user.id) {
      return res.status(404).json({ error: "Notification introuvable." });
    }
    await prisma.notification.update({ where: { id: req.params.id }, data: { isRead: true } });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

/** PATCH /api/notifications/read-all */
export async function markAllAsRead(req, res, next) {
  try {
    await prisma.notification.updateMany({
      where: { recipientId: req.user.id, isRead: false },
      data: { isRead: true },
    });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
