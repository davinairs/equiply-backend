const db = require("../config/database");

async function getAllBorrowRequests(companyId) {
  const [rows] = await db.query(`
    SELECT
      br.id,
      br.userId,
      u.fullName,
      un.unitName AS unitName, 
      br.equipmentId,
      e.equipmentName,
      e.companyId,
      br.borrowDate,
      br.dueDate,
      br.returnDate,
      br.reason,
      br.borrowStatus,
      br.createdAt,
      br.updatedAt
    FROM borrow_requests br
    JOIN users u ON br.userId = u.id
    LEFT JOIN units un ON u.unitId = un.id 
    JOIN equipments e ON br.equipmentId = e.id
    WHERE e.companyId = ?
    ORDER BY br.createdAt DESC`,
    [companyId],
  );

  return rows;
}

async function getAllBorrowRequestsAcrossCompanies() {
  const [rows] = await db.query(`
    SELECT
      br.id,
      br.userId,
      u.fullName,
      un.unitName AS unitName,
      br.equipmentId,
      e.equipmentName,
      e.companyId,
      br.borrowDate,
      br.dueDate,
      br.returnDate,
      br.reason,
      br.borrowStatus,
      br.createdAt,
      br.updatedAt
    FROM borrow_requests br
    JOIN users u ON br.userId = u.id
    LEFT JOIN units un ON u.unitId = un.id
    JOIN equipments e ON br.equipmentId = e.id
    ORDER BY br.createdAt DESC`);

  return rows;
}

async function getBorrowRequestsByUser(userId) {
  const [rows] = await db.query(`
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
  const [rows] = await db.query(`
    SELECT
      br.id,
      br.userId,
      u.fullName,
      un.unitName AS unitName,
      br.equipmentId,
      e.equipmentName,
      e.equipmentStatus,
      e.companyId,
      br.borrowDate,
      br.dueDate,
      br.returnDate,
      br.reason,
      br.borrowStatus,
      br.createdAt,
      br.updatedAt
    FROM borrow_requests br
    JOIN users u ON br.userId = u.id
    LEFT JOIN units un ON u.unitId = un.id
    JOIN equipments e ON br.equipmentId = e.id
    WHERE br.id = ?`,
    [id],
  );

  return rows[0];
}

async function getBorrowRequestsByEquipmentId(equipmentId) {
  const [rows] = await db.query(
    `SELECT id FROM borrow_requests 
     WHERE equipmentId = ? AND borrowStatus IN ('pending', 'approved') LIMIT 1`,
    [equipmentId]);

  return rows;
}

async function createBorrowRequest(borrowRequestData) {
  const { userId, equipmentId, borrowDate, reason } = borrowRequestData;
  const [result] = await db.query(
    `INSERT INTO borrow_requests (userId, equipmentId, borrowDate, reason) VALUES (?, ?, ?, ?)`,
    [userId, equipmentId, borrowDate, reason]);

  return getBorrowRequestById(result.insertId);
}

async function updateBorrowRequest(id, borrowRequestData) {
  const allowedFields = ["dueDate", "borrowStatus"];
  const fieldsToUpdate = Object.keys(borrowRequestData).filter((key) =>
    allowedFields.includes(key),
  );

  if (fieldsToUpdate.length === 0) {
    return getBorrowRequestById(id);
  }

  const setClause = fieldsToUpdate.map((field) => `${field} = ?`).join(", ");
  const values = fieldsToUpdate.map((field) => borrowRequestData[field]);

  await db.query(`UPDATE borrow_requests SET ${setClause} WHERE id = ?`, [
    ...values,
    id,
  ]);

  return getBorrowRequestById(id);
}

async function rejectOtherPendingRequests(equipmentId, approvedRequestId) {
  await db.query(
    `UPDATE borrow_requests 
     SET borrowStatus = 'rejected' 
     WHERE equipmentId = ? AND id != ? AND borrowStatus = 'pending'`,
    [equipmentId, approvedRequestId]);
}

async function returnBorrowRequest(id) {
  await db.query(
    `UPDATE borrow_requests SET returnDate = CURDATE(), borrowStatus = 'returned' WHERE id = ?`, [id]);
  return getBorrowRequestById(id);
}

async function deleteBorrowRequest(id) {
  await db.execute("DELETE FROM notifications WHERE borrowRequestId = ?", [id]);

  const [result] = await db.execute(
    "DELETE FROM borrow_requests WHERE id = ?"[id]);

  return result;
}

module.exports = {
  getAllBorrowRequests,
  getAllBorrowRequestsAcrossCompanies,
  getBorrowRequestsByUser,
  getBorrowRequestById,
  getBorrowRequestsByEquipmentId,
  createBorrowRequest,
  updateBorrowRequest,
  rejectOtherPendingRequests,
  returnBorrowRequest,
  deleteBorrowRequest,
};
