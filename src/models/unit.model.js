const db = require("../config/database");

async function getAllUnits() {
  const [rows] = await db.query(`SELECT * FROM units`);
  return rows;
}

async function getUnitsByCompanyId(companyId) {
  const [rows] = await db.query(`SELECT * FROM units WHERE companyId = ?`, 
    [companyId]);

  return rows;
}

async function getUnitById(id) {
  const [rows] = await db.query(`SELECT * FROM units WHERE id = ?`, [id]);
  return rows[0];
}

async function getUnitByNameInCompany(companyId, unitName) {
  const [rows] = await db.query(
    `SELECT * FROM units WHERE companyId = ? AND unitName = ?`,
    [companyId, unitName]);

  return rows[0];
}

async function getUsersByUnitId(unitId) {
  const [rows] = await db.query(`SELECT id FROM users WHERE unitId = ? LIMIT 1`, [unitId]);
  return rows;
}

async function createUnit(unitData) {
  const { companyId, unitName } = unitData;

  const [result] = await db.query(
    `INSERT INTO units (companyId, unitName) VALUES (?, ?)`,
    [companyId, unitName]);

  return { id: result.insertId, companyId, unitName };
}

async function updateUnit(id, unitData) {
  const allowedFields = ["unitName"];
  const fieldsToUpdate = Object.keys(unitData).filter((key) =>
    allowedFields.includes(key),
  );

  if (fieldsToUpdate.length === 0) {
    return getUnitById(id);
  }

  const setClause = fieldsToUpdate.map((field) => `${field} = ?`).join(", ");
  const values = fieldsToUpdate.map((field) => unitData[field]);

  await db.query(`UPDATE units SET ${setClause} WHERE id = ?`, [...values, id]);
  
  return getUnitById(id);
}

async function deleteUnit(id) {
  const [result] = await db.query(`DELETE FROM units WHERE id = ?`, [id]);

  if (result.affectedRows === 0) return null;

  return true;
}

module.exports = {
  getAllUnits,
  getUnitsByCompanyId,
  getUnitById,
  getUnitByNameInCompany,
  getUsersByUnitId,
  createUnit,
  updateUnit,
  deleteUnit,
};
