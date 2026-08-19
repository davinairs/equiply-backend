const notificationService = require("../services/notification.service");

async function getAllNotifications(req, res, next) {
  try {
    const notifications = await notificationService.getAllNotifications(
      req.user,
    );
    res.json(notifications);
  } catch (error) {
    next(error);
  }
}

async function getNotificationById(req, res, next) {
  try {
    const { id } = req.params;
    const notification = await notificationService.getNotificationById(
      id,
      req.user,
    );
    res.json(notification);
  } catch (error) {
    next(error);
  }
}

async function markAsRead(req, res, next) {
  try {
    const { id } = req.params;
    const notification = await notificationService.markAsRead(id, req.user);

    res.status(200).json({
      message: "Notification marked as read",
      data: notification,
    });
  } catch (error) {
    next(error);
  }
}

async function deleteNotification(req, res, next) {
  try {
    const { id } = req.params;
    await notificationService.deleteNotification(id, req.user);

    res.status(200).json({
      message: "Notification deleted successfully",
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAllNotifications,
  getNotificationById,
  markAsRead,
  deleteNotification,
};