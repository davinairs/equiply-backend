const userModel = require("../models/user.model");
const bcrypt = require("bcrypt");
const AppError = require("../untils/app.error");

async function getAllUsers() {
  return userModel.getAllUsers();
}

async function getUserById(id) {
  const user = await userModel.getUserById(id);
  if (!user) {
    throw new AppError("User not found", 404);
  }
  return user;
}

async function createUser(userData) {
  const { username, email, password } = userData;

  const existingUsername = await userModel.getUserByUsername(username);
  if (existingUsername) {
    throw new AppError("Username is already in use", 409);
  }

  const existingEmail = await userModel.getUserByEmail(email);
  if (existingEmail) {
    throw new AppError("Email is already in use", 409);
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = { ...userData, password: hashedPassword };

  return userModel.createUser(newUser);
}

async function checkUsernameEmailConflict(id, username, email) {
  if (username) {
    const existingUsername = await userModel.getUserByUsername(username);
    if (existingUsername && existingUsername.id !== Number(id)) {
      throw new AppError("Username is already in use", 409);
    }
  }
  if (email) {
    const existingEmail = await userModel.getUserByEmail(email);
    if (existingEmail && existingEmail.id !== Number(id)) {
      throw new AppError("Email is already in use", 409);
    }
  }
}

async function updateUser(id, userData) {
  const { username, email } = userData;

  const user = await userModel.getUserById(id);
  if (!user) {
    throw new AppError("User not found", 404);
  }

  if ("password" in userData) {
    throw new AppError("Password cannot be changed through this endpoint", 400);
  }
  if ("status" in userData) {
    throw new AppError("Status cannot be changed through this endpoint, use the activate/deactivate endpoint", 400);
  }
  if ("id" in userData) {
    throw new AppError("ID cannot be changed", 400);
  }
  if ("createdAt" in userData) {
    throw new AppError("Created At cannot be changed", 400);
  }
  if ("updatedAt" in userData) {
    throw new AppError("Updated At cannot be changed", 400);
  }

  await checkUsernameEmailConflict(id, username, email);

  return userModel.updateUser(id, userData);
}

async function updateMyProfile(id, userData) {
  const { username, email } = userData;

  const user = await userModel.getUserById(id);
  if (!user) {
    throw new AppError("User not found", 404);
  }

  if ("password" in userData) {
    throw new AppError("Password cannot be changed through this endpoint, use change-password", 400);
  }
  if ("status" in userData) {
    throw new AppError("Status cannot be changed by yourself", 400);
  }
  if ("role" in userData) {
    throw new AppError("Role cannot be changed by yourself", 403);
  }
  if ("companyId" in userData) {
    throw new AppError("Company cannot be changed by yourself", 403);
  }
  if ("id" in userData) {
    throw new AppError("ID cannot be changed", 400);
  }
  if ("createdAt" in userData) {
    throw new AppError("Created At cannot be changed", 400);
  }
  if ("updatedAt" in userData) {
    throw new AppError("Updated At cannot be changed", 400);
  }

  await checkUsernameEmailConflict(id, username, email);

  return userModel.updateUser(id, userData);
}

async function changePassword(userId, passwordData) {
  const { oldPassword, newPassword } = passwordData;

  const user = await userModel.getUserByIdWithPassword(userId);
  if (!user) {
    throw new AppError("User not found", 404);
  }

  const isMatch = await bcrypt.compare(oldPassword, user.password);
  if (!isMatch) {
    throw new AppError("Incorrect old password", 401);
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  return userModel.changePassword(userId, hashedPassword);
}

async function deactivateUser(id) {
  const user = await userModel.getUserById(id);
  if (!user) {
    throw new AppError("User not found", 404);
  }
  if (user.status === "inactive") {
    throw new AppError("User is already inactive", 400);
  }
  return userModel.updateUserStatus(id, "inactive");
}

async function activateUser(id) {
  const user = await userModel.getUserById(id);
  if (!user) {
    throw new AppError("User not found", 404);
  }
  if (user.status === "active") {
    throw new AppError("User is already active", 400);
  }
  return userModel.updateUserStatus(id, "active");
}

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  updateMyProfile,
  changePassword,
  deactivateUser,
  activateUser,
};