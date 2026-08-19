const db = require("../config/database");

async function getAllEquipments() {
  const [rows] = await db.query(`
    SELECT
      equipments.id, 
      equipments.equipmentName, 
      equipments.serialNumber,
      equipments.categoryId, 
      categories.categoryName, 
      equipments.location,
      equipments.equipmentImage, 
      equipments.equipmentCondition, 
      equipments.description,
      equipments.equipmentStatus, 
      equipments.createdAt, 
      equipments.updatedAt
    FROM equipments
    JOIN categories ON equipments.categoryId = categories.id`);

  return rows;
}

async function getEquipmentById(id) {
  const [rows] = await db.query(
    `
    SELECT
      equipments.id, 
      equipments.equipmentName, 
      equipments.serialNumber,
      equipments.categoryId, 
      categories.categoryName, 
      equipments.location,
      equipments.equipmentImage, 
      equipments.equipmentCondition, 
      equipments.description,
      equipments.equipmentStatus, 
      equipments.createdAt, 
      equipments.updatedAt
    FROM equipments
    JOIN categories ON equipments.categoryId = categories.id
    WHERE equipments.id = ?`,
    [id],
  );

  return rows[0];
}

async function createEquipment(equipmentData) {
  const {
    equipmentName,
    serialNumber,
    categoryId,
    location,
    equipmentImage,
    equipmentCondition,
    description,
  } = equipmentData;

  const [result] = await db.query(
    `
    INSERT INTO equipments 
    (equipmentName, 
    serialNumber, 
    categoryId, 
    location, 
    equipmentImage, 
    equipmentCondition, 
    description)
    VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      equipmentName,
      serialNumber,
      categoryId,
      location,
      equipmentImage,
      equipmentCondition,
      description,
    ],
  );

  return getEquipmentById(result.insertId);
}

async function updateEquipment(id, equipmentData) {
  const allowedFields = [
    "equipmentName",
    "categoryId",
    "location",
    "equipmentImage",
    "equipmentCondition",
    "description",
    "equipmentStatus",
  ];
  const fieldsToUpdate = Object.keys(equipmentData).filter((key) =>
    allowedFields.includes(key),
  );

  if (fieldsToUpdate.length === 0) {
    return getEquipmentById(id);
  }

  const setClause = fieldsToUpdate.map((field) => `${field} = ?`).join(", ");
  const values = fieldsToUpdate.map((field) => equipmentData[field]);

  await db.query(`UPDATE equipments SET ${setClause} WHERE id = ?`, [
    ...values,
    id,
  ]);
  return getEquipmentById(id);
}

async function updateEquipmentStatus(id, equipmentStatus) {
  await db.query(`UPDATE equipments SET equipmentStatus = ? WHERE id = ?`, [
    equipmentStatus,
    id,
  ]);
  return getEquipmentById(id);
}

async function deleteEquipment(id) {
  const [result] = await db.query(`DELETE FROM equipments WHERE id = ?`, [id]);

  if (result.affectedRows === 0) return null;

  return true;
}

async function getEquipmentBySerialNumber(serialNumber) {
  const [rows] = await db.query(
    ` SELECT * FROM equipments WHERE serialNumber = ?`,
    [serialNumber],
  );

  return rows[0];
}

async function getBorrowRequestsByEquipmentId(equipmentId) {
  const [rows] = await db.query(
    `SELECT id FROM borrow_requests WHERE equipmentId = ? LIMIT 1`,
    [equipmentId],
  );

  return rows;
}

module.exports = {
  getAllEquipments,
  getEquipmentById,
  createEquipment,
  updateEquipment,
  updateEquipmentStatus,
  deleteEquipment,
  getEquipmentBySerialNumber,
  getBorrowRequestsByEquipmentId,
};
