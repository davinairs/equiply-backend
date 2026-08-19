const db = require("../config/database");

async function getAllBorrowRequests() {
  const [rows] = await db.query(`
    SELECT
      br.id,
      br.userId,
      u.fullName,
      br.equipmentId,
      e.equipmentName,
      br.borrowDate,
      br.dueDate,
      br.returnDate,
      br.reason,
      br.borrowStatus,
      br.createdAt,
      br.updatedAt
    FROM borrow_requests br
    JOIN users u ON br.userId = u.id
    JOIN equipments e ON br.equipmentId = e.id
    ORDER BY br.createdAt DESC`);

  return rows;
}

async function getBorrowRequestsByUser(userId) {
  const [rows] = await db.query(
    `
    SELECT
      br.id,
      br.equipmentId,
      e.equipmentName,
      br.borrowDate,
      br.dueDate,
      br.returnDate,
      br.reason,
      br.borrowStatus,
      br.createdAt,
      br.updatedAt
    FROM borrow_requests br
    JOIN equipments e ON br.equipmentId = e.id
    WHERE br.userId = ?
    ORDER BY br.createdAt DESC`,
    [userId],
  );

  return rows;
}

async function getBorrowRequestById(id) {
  const [rows] = await db.query(
    `
    SELECT
      br.id,
      br.userId,
      u.fullName,
      br.equipmentId,
      e.equipmentName,
      e.equipmentStatus,
      br.borrowDate,
      br.dueDate,
      br.returnDate,
      br.reason,
      br.borrowStatus,
      br.createdAt,
      br.updatedAt
    FROM borrow_requests br
    JOIN users u ON br.userId = u.id
    JOIN equipments e ON br.equipmentId = e.id
    WHERE br.id = ?`,
    [id],
  );

  return rows[0];
}

async function getActiveBorrowRequestByEquipmentId(equipmentId) {
  const [rows] = await db.query(
    `SELECT id FROM borrow_requests WHERE equipmentId = ? AND borrowStatus = 'approved' LIMIT 1`,
    [equipmentId],
  );

  return rows[0];
}

async function createBorrowRequest(borrowRequestData) {
  const { userId, equipmentId, borrowDate, reason } = borrowRequestData;

  const [result] = await db.query(
    `INSERT INTO borrow_requests (userId, equipmentId, borrowDate, reason) VALUES (?, ?, ?, ?)`,
    [userId, equipmentId, borrowDate, reason],
  );

  return getBorrowRequestById(result.insertId);
}

async function updateBorrowRequest(id, borrowRequestData) {
  const { dueDate, borrowStatus } = borrowRequestData;

  await db.query(
    `UPDATE borrow_requests SET dueDate = ?, borrowStatus = ? WHERE id = ?`,
    [dueDate, borrowStatus, id],
  );

  return getBorrowRequestById(id);
}

async function returnBorrowRequest(id) {
  await db.query(
    `UPDATE borrow_requests SET returnDate = CURDATE(), borrowStatus = 'returned' WHERE id = ?`,
    [id],
  );

  return getBorrowRequestById(id);
}

async function deleteBorrowRequest(id) {
  await db.execute("DELETE FROM notifications WHERE borrowRequestId = ?", [id]);

  const [result] = await db.execute("DELETE FROM borrow_requests WHERE id = ?", [id]);
  return result;
}

module.exports = {
  getAllBorrowRequests,
  getBorrowRequestsByUser,
  getBorrowRequestById,
  getActiveBorrowRequestByEquipmentId,
  createBorrowRequest,
  updateBorrowRequest,
  returnBorrowRequest,
  deleteBorrowRequest,
};
