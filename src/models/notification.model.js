const db = require("../config/database");

async function getAllNotifications(userId) {
  const [rows] = await db.query(
    `SELECT id, borrowRequestId, title, message, isRead, createdAt
     FROM notifications WHERE userId = ? ORDER BY createdAt DESC`,
    [userId],
  );

  return rows;
}

async function getAllAdminNotifications(companyId) {
  const [rows] = await db.query(`
    SELECT 
      notifications.id, 
      notifications.userId,
      users.username, 
      users.fullName,
      notifications.borrowRequestId, 
      notifications.title, 
      notifications.message,
      notifications.isRead, 
      notifications.createdAt
    FROM notifications
    JOIN users ON notifications.userId = users.id
    WHERE users.companyId = ?
    ORDER BY notifications.createdAt DESC`,
    [companyId],
  );

  return rows;
}

async function getNotificationById(id) {
  const [rows] = await db.query(`
    SELECT 
      notifications.id, 
      notifications.userId, 
      users.companyId,
      notifications.borrowRequestId, 
      notifications.title, 
      notifications.message,
      notifications.isRead, 
      notifications.createdAt
    FROM notifications
    JOIN users ON notifications.userId = users.id
    WHERE notifications.id = ?`,
    [id],
  );

  return rows[0];
}

async function createNotification(notificationData) {
  const { userId, borrowRequestId, title, message } = notificationData;
  const [result] = await db.query(
    `INSERT INTO notifications (userId, borrowRequestId, title, message) VALUES (?, ?, ?, ?)`,
    [userId, borrowRequestId, title, message],
  );
  return {
    id: result.insertId,
    userId,
    borrowRequestId,
    title,
    message,
    isRead: false,
  };
}

async function checkExisting(userId, borrowRequestId, title) {
  const [rows] = await db.query(
    `SELECT id FROM notifications WHERE userId = ? AND borrowRequestId = ? AND title = ?`,
    [userId, borrowRequestId, title],
  );

  return rows[0];
}

async function updateNotificationReadStatus(id, isRead) {
  await db.query(`UPDATE notifications SET isRead = ? WHERE id = ?`, [
    isRead,
    id,
  ]);

  return getNotificationById(id);
}

async function markAllAsRead(userId) {
  await db.query(
    `UPDATE notifications SET isRead = true WHERE userId = ? AND isRead = false`,
    [userId],
  );
}

async function deleteNotification(id) {
  const [result] = await db.query(`DELETE FROM notifications WHERE id = ?`, [
    id,
  ]);

  if (result.affectedRows === 0) return null;

  return true;
}

module.exports = {
  getAllNotifications,
  getAllAdminNotifications,
  getNotificationById,
  createNotification,
  checkExisting,
  updateNotificationReadStatus,
  markAllAsRead,
  deleteNotification,
};