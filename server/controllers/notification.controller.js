const prisma = require('../config/db');
const { sendSuccess, sendPaginated, sendError } = require('../utils/response');
const { getPaginationParams, buildPaginationMeta } = require('../utils/pagination');

exports.getNotifications = async (req, res) => {
    const { page = 1, limit = 20 } = req.query;
    const { skip, take } = getPaginationParams(page, limit);

    const [notifications, total] = await Promise.all([
        prisma.notification.findMany({
            where: { userId: req.user.id },
            skip,
            take,
            orderBy: { createdAt: 'desc' }
        }),
        prisma.notification.count({ where: { userId: req.user.id } })
    ]);

    sendPaginated(res, notifications, buildPaginationMeta(total, page, limit));
};

exports.getUnreadCount = async (req, res) => {
    const count = await prisma.notification.count({
        where: { userId: req.user.id, isRead: false }
    });
    sendSuccess(res, { count });
};

exports.markAsRead = async (req, res) => {
    const notification = await prisma.notification.findUnique({
        where: { id: req.params.id }
    });

    if (!notification || notification.userId !== req.user.id) {
        return sendError(res, 'Notification not found', 404);
    }

    const updated = await prisma.notification.update({
        where: { id: req.params.id },
        data: { isRead: true }
    });

    sendSuccess(res, updated);
};

exports.markAllAsRead = async (req, res) => {
    await prisma.notification.updateMany({
        where: { userId: req.user.id, isRead: false },
        data: { isRead: true }
    });
    
    sendSuccess(res, null, 'All notifications marked as read');
};

exports.deleteNotification = async (req, res) => {
    const notification = await prisma.notification.findUnique({
        where: { id: req.params.id }
    });

    if (!notification || notification.userId !== req.user.id) {
        return sendError(res, 'Notification not found', 404);
    }

    await prisma.notification.delete({
        where: { id: req.params.id }
    });

    sendSuccess(res, null, 'Notification deleted successfully');
};
