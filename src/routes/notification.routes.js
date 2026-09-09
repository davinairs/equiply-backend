const express = require("express");
const router = express.Router();

const notificationController = require("../controllers/notification.controller");
const { verifyToken } = require("../middlewares/auth.middleware");

router.get(
  "/notifications",
  verifyToken,
  notificationController.getAllNotifications,
);

router.patch(
  "/notifications/mark-all-read",
  verifyToken,
  notificationController.markAllAsRead,
);

router.get(
  "/notifications/:id",
  verifyToken,
  notificationController.getNotificationById,
);

router.patch(
  "/notifications/:id/read",
  verifyToken,
  notificationController.markAsRead,
);

router.delete(
  "/notifications/:id",
  verifyToken,
  notificationController.deleteNotification,
);

module.exports = router;