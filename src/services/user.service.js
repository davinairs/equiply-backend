const userModel = require("../models/user.model");
const unitModel = require("../models/unit.model");
const companyModel = require("../models/company.model");
const borrowRequestModel = require("../models/borrowrequest.model");
const bcrypt = require("bcrypt");
const AppError = require("../untils/app.error");

function assertCompanyAccess(currentUser, resourceCompanyId) {
  if (
    currentUser.role !== "superadmin" &&
    currentUser.companyId !== resourceCompanyId
  ) {
    throw new AppError("Forbidden. You can only access users in your own company.", 403);
  }
}

async function getAllUsers(currentUser) {
  if (currentUser.role === "superadmin") {
    throw new AppError("Superadmin cannot access user lists. Use the admin management endpoints instead.", 403);
  }

  return userModel.getAllUsers(currentUser.companyId);
}

async function getUserById(id, currentUser) {
  const user = await userModel.getUserById(id);
  if (!user) {
    throw new AppError("User not found", 404);
  }

  const isSelf = Number(id) === Number(currentUser.id);

  if (currentUser.role === "superadmin" && !isSelf) {
    throw new AppError("Superadmin cannot access user data. Use the admin management endpoints instead.", 403);
  }

  if (!isSelf) {
    assertCompanyAccess(currentUser, user.companyId);
  }

  return user;
}

async function getAllAdmins(currentUser) {
  if (currentUser.role !== "superadmin") {
    throw new AppError("Forbidden. Only superadmin can access admin data.", 403);
  }

  return userModel.getAllAdminsAcrossCompanies();
}

async function getAdminById(id, currentUser) {
  if (currentUser.role !== "superadmin") {
    throw new AppError("Forbidden. Only superadmin can access admin data.", 403);
  }
  const admin = await userModel.getUserById(id);
  if (!admin || admin.role !== "admin") {
    throw new AppError("Admin not found", 404);
  }
  
  return admin;
}

async function createUser(userData, currentUser) {
  const { username, email, password, unitId, fullName, profileImage } =
    userData;
  const companyId = currentUser.companyId; 

  if (unitId) {
    const unit = await unitModel.getUnitById(unitId);
    if (!unit || unit.companyId !== companyId) {
      throw new AppError("Unit does not belong to your company", 400);
    }
  }

  const existingUsername = await userModel.getUserByUsername(username);
  if (existingUsername) {
    throw new AppError("Username is already in use", 409);
  }

  const existingEmail = await userModel.getUserByEmail(email);
  if (existingEmail) {
    throw new AppError("Email is already in use", 409);
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = {
    companyId,
    unitId: unitId || null,
    username,
    fullName,
    email,
    password: hashedPassword,
    profileImage: profileImage || null,
    role: "user", 
  };

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

async function createAdminForCompany(companyId, adminData, currentUser) {
  if (currentUser.role !== "superadmin") {
    throw new AppError("Forbidden. Only superadmin can create admin accounts.", 403);
  }
  const company = await companyModel.getCompanyById(companyId);
  if (!company) {
    throw new AppError("Company not found", 404);
  }

  const { username, email } = adminData;

  const existingUsername = await userModel.getUserByUsername(username);
  if (existingUsername) {
    throw new AppError("Username already taken", 409);
  }

  const existingEmail = await userModel.getUserByEmail(email);
  if (existingEmail) {
    throw new AppError("Email already registered", 409);
  }

  return userModel.createAdminForCompany({ ...adminData, companyId });
}

async function updateUser(id, userData, currentUser) {
  const { username, email, unitId } = userData;
  const user = await userModel.getUserById(id);
  if (!user) {
    throw new AppError("User not found", 404);
  }

  assertCompanyAccess(currentUser, user.companyId);

  if (user.role !== "user" && currentUser.role !== "superadmin") {
    throw new AppError("You can only manage user accounts, not other admins", 403);
  }

  if ("password" in userData) {
    throw new AppError("Password cannot be changed through this endpoint", 400);
  }
  if ("status" in userData) {
    throw new AppError("Status cannot be changed through this endpoint, use the activate/deactivate endpoint", 400);
  }
  if ("role" in userData) {
    throw new AppError("Role cannot be changed through this endpoint", 400);
  }
  if ("companyId" in userData) {
    throw new AppError("User cannot be moved to a different company", 400);
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

  if (unitId) {
    const unit = await unitModel.getUnitById(unitId);
    if (!unit || unit.companyId !== user.companyId) {
      throw new AppError("Unit does not belong to your company", 400);
    }
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

async function deactivateUser(id, currentUser) {
  if (Number(id) === Number(currentUser.id)) {
    throw new AppError("You cannot deactivate your own account", 400);
  }

  const user = await userModel.getUserById(id);
  if (!user) {
    throw new AppError("User not found", 404);
  }

  if (currentUser.role === "superadmin" && user.role !== "admin") {
    throw new AppError("Superadmin can only manage admin accounts", 403);
  }
  if (user.role === "admin" && currentUser.role !== "superadmin") {
    throw new AppError("Only superadmin can deactivate an admin account", 403);
  }

  assertCompanyAccess(currentUser, user.companyId);

  if (user.status === "inactive") {
    throw new AppError("User is already inactive", 400);
  }

  const userBorrowRequests =
    await borrowRequestModel.getBorrowRequestsByUser(id);
  const hasActiveBorrow = userBorrowRequests.some(
    (r) => r.borrowStatus === "pending" || r.borrowStatus === "approved",
  );
  if (hasActiveBorrow) {
    throw new AppError(
      "User still has pending or ongoing borrow requests and cannot be deactivated",
      400,
    );
  }

  return userModel.updateUserStatus(id, "inactive");
}

async function activateUser(id, currentUser) {
  const user = await userModel.getUserById(id);
  if (!user) {
    throw new AppError("User not found", 404);
  }

  if (currentUser.role === "superadmin" && user.role !== "admin") {
    throw new AppError("Superadmin can only manage admin accounts", 403);
  }
  if (user.role === "admin" && currentUser.role !== "superadmin") {
    throw new AppError("Only superadmin can activate an admin account", 403);
  }

  assertCompanyAccess(currentUser, user.companyId);

  if (user.status === "active") {
    throw new AppError("User is already active", 400);
  }
  return userModel.updateUserStatus(id, "active");
}

module.exports = {
  getAllUsers,
  getUserById,
  getAllAdmins,
  getAdminById,
  createUser,
  createAdminForCompany,
  updateUser,
  updateMyProfile,
  changePassword,
  deactivateUser,
  activateUser,
};
