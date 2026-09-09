const db = require("../config/database");
const bcrypt = require("bcrypt");

async function getAllUsers(companyId) {
  const [rows] = await db.query(`
    SELECT
      users.id, 
      companies.companyName, 
      units.unitName,
      users.username, 
      users.fullName,
      users.email, 
      users.profileImage, 
      users.role, 
      users.status,
      users.createdAt, 
      users.updatedAt
    FROM users
    LEFT JOIN companies ON users.companyId = companies.id
    LEFT JOIN units ON users.unitId = units.id
    WHERE users.companyId = ?`,
    [companyId],
  );

  return rows;
}

async function getUserById(id) {
  const [rows] = await db.query(`
    SELECT
      users.id, 
      users.companyId, 
      companies.companyName, 
      users.username,
      users.fullName, 
      users.email, 
      users.profileImage, 
      users.role,
      users.status, 
      users.createdAt, 
      users.updatedAt
    FROM users
    LEFT JOIN companies ON users.companyId = companies.id
    WHERE users.id = ?`,
    [id],
  );

  return rows[0];
}

async function getUserByEmail(email) {
  const [rows] = await db.query(`SELECT * FROM users WHERE email = ?`, [email]);
  return rows[0];
}

async function getUserByUsername(username) {
  const [rows] = await db.query(`SELECT * FROM users WHERE username = ?`, [username]);
  return rows[0];
}

async function getUserByIdWithPassword(id) {
  const [rows] = await db.query(`SELECT * FROM users WHERE id = ?`, [id]);
  return rows[0];
}

async function getAllAdmins(companyId) {
  const [rows] = await db.query(`SELECT id FROM users WHERE role = 'admin' AND companyId = ?`,
    [companyId]);

  return rows;
}

async function getAllAdminsAcrossCompanies() {
  const [rows] = await db.query(`
    SELECT
      users.id,
      companies.companyName,
      users.username,
      users.fullName,
      users.email,
      users.status,
      users.createdAt,
      users.updatedAt
    FROM users
    LEFT JOIN companies ON users.companyId = companies.id
    WHERE users.role = 'admin'`);

  return rows;
}

async function getActiveBorrowsByUserId(userId) {
  const [rows] = await db.query(
    `SELECT id FROM borrow_requests WHERE userId = ? AND borrowStatus IN ('pending', 'approved')`,
    [userId]);

  return rows;
}

async function createUser(userData) {
  const {
    companyId,
    unitId,
    username,
    fullName,
    email,
    password,
    profileImage,
    role,
  } = userData;
  const hashedPassword = await bcrypt.hash(password, 10);
  const [result] = await db.query(
    `INSERT INTO users 
    (companyId, unitId, username, fullName, email, password, profileImage, role)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      companyId,
      unitId,
      username,
      fullName,
      email,
      hashedPassword,
      profileImage,
      role,
    ],
  );
  return {
    id: result.insertId,
    companyId,
    unitId,
    username,
    fullName,
    email,
    profileImage,
    role,
  };
}

async function createAdminForCompany({
  companyId,
  username,
  fullName,
  email,
  password,
}) {
  const hashedPassword = await bcrypt.hash(password, 10);

  const [result] = await db.query(
    `INSERT INTO users (companyId, unitId, username, fullName, email, password, role, status)
     VALUES (?, NULL, ?, ?, ?, ?, 'admin', 'active')`,
    [companyId, username, fullName, email, hashedPassword]);

  return {
    id: result.insertId,
    companyId,
    username,
    fullName,
    email,
    role: "admin",
    status: "active",
  };
}

async function updateUser(id, userData) {
  const allowedFields = [
    "companyId",
    "unitId",
    "username",
    "fullName",
    "email",
    "profileImage",
    "role",
  ];
  const fieldsToUpdate = Object.keys(userData).filter((key) =>
    allowedFields.includes(key),
  );

  if (fieldsToUpdate.length === 0) {
    return getUserById(id);
  }

  const setClause = fieldsToUpdate.map((field) => `${field} = ?`).join(", ");
  const values = fieldsToUpdate.map((field) => userData[field]);

  await db.query(`UPDATE users SET ${setClause} WHERE id = ?`, [...values, id]);

  return getUserById(id);
}

async function changePassword(id, hashedPassword) {
  await db.query(`UPDATE users SET password = ? WHERE id = ?`,
    [hashedPassword, id]);

  return getUserById(id);
}

async function updateUserStatus(id, status) {
  await db.query(`UPDATE users SET status = ? WHERE id = ?`, [status, id]);
  return getUserById(id);
}

module.exports = {
  getAllUsers,
  getUserById,
  getUserByEmail,
  getUserByUsername,
  getUserByIdWithPassword,
  getAllAdmins,
  getAllAdminsAcrossCompanies,
  getActiveBorrowsByUserId,
  createUser,
  createAdminForCompany,
  updateUser,
  changePassword,
  updateUserStatus,
};
