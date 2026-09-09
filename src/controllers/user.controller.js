const userService = require("../services/user.service");

async function getAllUsers(req, res, next) {
  try {
    const users = await userService.getAllUsers(req.user);
    res.json(users);
  } catch (error) {
    next(error);
  }
}

async function getUserById(req, res, next) {
  try {
    const { id } = req.params;
    const user = await userService.getUserById(id, req.user);
    res.json(user);
  } catch (error) {
    next(error);
  }
}

async function getMyProfile(req, res, next) {
  try {
    const user = await userService.getUserById(req.user.id, req.user);
    res.json(user);
  } catch (error) {
    next(error);
  }
}

async function createUser(req, res, next) {
  try {
    const userData = { ...req.body };
    if (req.file) userData.profileImage = req.file.path;
    const user = await userService.createUser(userData, req.user); 
    res.status(201).json({ message: "User created successfully", data: user });
  } catch (error) {
    next(error);
  }
}

async function getAllAdmins(req, res, next) {
  try {
    const admins = await userService.getAllAdmins(req.user);
    res.json(admins);
  } catch (error) {
    next(error);
  }
}

async function getAdminById(req, res, next) {
  try {
    const { id } = req.params;
    const admin = await userService.getAdminById(id, req.user);
    res.json(admin);
  } catch (error) {
    next(error);
  }
}

async function createAdminForCompany(req, res, next) {
  try {
    const admin = await userService.createAdminForCompany(
      req.params.companyId,
      req.body,
      req.user,
    );
    res.status(201).json(admin);
  } catch (err) {
    next(err);
  }
}

async function updateUser(req, res, next) {
  try {
    const { id } = req.params;
    const userData = req.body;
    const user = await userService.updateUser(id, userData, req.user);
    res.status(200).json({ message: "User updated successfully", data: user });
  } catch (error) {
    next(error);
  }
}

async function updateMyProfile(req, res, next) {
  try {
    const userData = { ...req.body };

    if (req.file) {
      userData.profileImage = req.file.path;
    }

    const user = await userService.updateMyProfile(req.user.id, userData);
    res
      .status(200)
      .json({ message: "Profile updated successfully", data: user });
  } catch (error) {
    next(error);
  }
}

async function changePassword(req, res, next) {
  try {
    const passwordData = req.body;
    await userService.changePassword(req.user.id, passwordData);

    res.status(200).json({
      message: "Password changed successfully",
    });
  } catch (error) {
    next(error);
  }
}

async function deactivateUser(req, res, next) {
  try {
    const { id } = req.params;
    const user = await userService.deactivateUser(id, req.user);

    res.status(200).json({
      message: "User deactivated successfully",
      data: user,
    });
  } catch (error) {
    next(error);
  }
}

async function activateUser(req, res, next) {
  try {
    const { id } = req.params;
    const user = await userService.activateUser(id, req.user);

    res.status(200).json({
      message: "User activated successfully",
      data: user,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAllUsers,
  getUserById,
  getMyProfile,
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
