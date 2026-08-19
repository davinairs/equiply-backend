const db = require("../config/database");

async function getAllCompanies() {
  const [rows] = await db.query(`SELECT * FROM companies`);

  return rows;
}

async function getCompanyById(id) {
  const [rows] = await db.query(`SELECT * FROM companies WHERE id = ?`, [id]);

  return rows[0];
}

async function getCompanyByName(companyName) {
  const [rows] = await db.query(
    `SELECT * FROM companies WHERE companyName = ?`,
    [companyName],
  );

  return rows[0];
}

async function getUsersByCompanyId(companyId) {
  const [rows] = await db.query(
    `SELECT id FROM users WHERE companyId = ? LIMIT 1`,
    [companyId],
  );

  return rows;
}

async function createCompany(companyData) {
  const { companyName } = companyData;

  const [result] = await db.query(
    `INSERT INTO companies (companyName) VALUES (?)`,
    [companyName],
  );

  return { id: result.insertId, companyName };
}

async function updateCompany(id, companyData) {
  const allowedFields = ["companyName"];
  const fieldsToUpdate = Object.keys(companyData).filter((key) =>
    allowedFields.includes(key),
  );

  if (fieldsToUpdate.length === 0) {
    return getCompanyById(id);
  }

  const setClause = fieldsToUpdate.map((field) => `${field} = ?`).join(", ");
  const values = fieldsToUpdate.map((field) => companyData[field]);

  await db.query(`UPDATE companies SET ${setClause} WHERE id = ?`, [
    ...values,
    id,
  ]);
  return getCompanyById(id);
}

async function deleteCompany(id) {
  const [result] = await db.query(`DELETE FROM companies WHERE id = ?`, [id]);

  if (result.affectedRows === 0) return null;

  return true;
}

module.exports = {
  getAllCompanies,
  getCompanyById,
  getCompanyByName,
  getUsersByCompanyId,
  createCompany,
  updateCompany,
  deleteCompany,
};
