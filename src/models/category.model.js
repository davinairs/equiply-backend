const db = require("../config/database");

async function getAllCategories() {
  const [rows] = await db.query(`SELECT * FROM categories`);

  return rows;
}

async function getCategoryById(id) {
  const [rows] = await db.query(`SELECT * FROM categories WHERE id = ?`, [id]);

  return rows[0];
}

async function getCategoryByName(categoryName) {
  const [rows] = await db.query(
    `SELECT * FROM categories WHERE categoryName = ?`,
    [categoryName],
  );

  return rows[0];
}

async function getEquipmentsByCategoryId(categoryId) {
  const [rows] = await db.query(
    `SELECT id FROM equipments WHERE categoryId = ? LIMIT 1`,
    [categoryId],
  );

  return rows;
}

async function createCategory(categoryData) {
  const { categoryName, description } = categoryData;

  const [result] = await db.query(
    `INSERT INTO categories (categoryName, description) VALUES (?, ?)`,
    [categoryName, description],
  );

  return { id: result.insertId, categoryName, description };
}

async function updateCategory(id, categoryData) {
  const allowedFields = ["categoryName", "description"];
  const fieldsToUpdate = Object.keys(categoryData).filter((key) =>
    allowedFields.includes(key),
  );

  if (fieldsToUpdate.length === 0) {
    return getCategoryById(id);
  }

  const setClause = fieldsToUpdate.map((field) => `${field} = ?`).join(", ");
  const values = fieldsToUpdate.map((field) => categoryData[field]);

  await db.query(`UPDATE categories SET ${setClause} WHERE id = ?`, [
    ...values,
    id,
  ]);

  return getCategoryById(id);
}

async function deleteCategory(id) {
  const [result] = await db.query(`DELETE FROM categories WHERE id = ?`, [id]);
  if (result.affectedRows === 0) return null;

  return true;
}

module.exports = {
  getAllCategories,
  getCategoryById,
  getCategoryByName,
  getEquipmentsByCategoryId,
  createCategory,
  updateCategory,
  deleteCategory,
};
