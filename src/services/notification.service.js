const notificationModel = require("../models/notification.model");
const AppError = require("../untils/app.error");

async function getAllNotifications(currentUser) {
  if (currentUser.role === "admin") {
    return notificationModel.getAllAdminNotifications();
  }

  return notificationModel.getAllNotifications(currentUser.id);
}

async function getNotificationById(id, currentUser) {
  const notification = await notificationModel.getNotificationById(id);

  if (!notification) {
    throw new AppError("Notification not found", 404);
  }

  if (currentUser.role !== "admin" && notification.userId !== currentUser.id) {
    throw new AppError("You are not authorized to access this data", 403);
  }

  return notification;
}

async function markAsRead(id, currentUser) {
  const notification = await notificationModel.getNotificationById(id);

  if (!notification) {
    throw new AppError("Notification not found", 404);
  }

  if (currentUser.role !== "admin" && notification.userId !== currentUser.id) {
    throw new AppError("You are not authorized to modify this data", 403);
  }

  if (notification.isRead) {
    return notification;
  }

  return notificationModel.updateNotificationReadStatus(id, true);
}

async function deleteNotification(id, currentUser) {
  const notification = await notificationModel.getNotificationById(id);

  if (!notification) {
    throw new AppError("Notification not found", 404);
  }

  if (notification.userId !== currentUser.id) {
    throw new AppError("You are not authorized to delete this notification", 403);
  }

  return notificationModel.deleteNotification(id);
}

module.exports = {
  getAllNotifications,
  getNotificationById,
  markAsRead,
  deleteNotification,
};