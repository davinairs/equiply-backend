const express = require("express");
const router = express.Router();

const userController = require("../controllers/user.controller");
const {
  validateUser,
  validateUpdateUser,
  validateUpdateMyProfile,
  validateChangePassword,
  validateCreateAdmin,
} = require("../middlewares/validation/user.validation");
const { verifyToken, authorizeRole } = require("../middlewares/auth.middleware");
const { uploadProfileImage } = require("../middlewares/upload.middleware");

router.get("/users/me", verifyToken, userController.getMyProfile);

router.put(
  "/users/me",
  verifyToken,
  uploadProfileImage.single("profileImage"),
  validateUpdateMyProfile,
  userController.updateMyProfile,
);

router.patch(
  "/users/me/change-password",
  verifyToken,
  validateChangePassword,
  userController.changePassword,
);

router.get(
  "/users",
  verifyToken,
  authorizeRole("admin"),
  userController.getAllUsers,
);

router.get(
  "/users/:id",
  verifyToken,
  authorizeRole("admin"),
  userController.getUserById,
);

router.post(
  "/users",
  verifyToken,
  authorizeRole("admin"),
  uploadProfileImage.single("profileImage"),
  validateUser,
  userController.createUser,
);

router.put(
  "/users/:id",
  verifyToken,
  authorizeRole("admin"),
  validateUpdateUser,
  userController.updateUser,
);

router.get(
  "/admins",
  verifyToken,
  authorizeRole("superadmin"),
  userController.getAllAdmins,
);

router.get(
  "/admins/:id",
  verifyToken,
  authorizeRole("superadmin"),
  userController.getAdminById,
);

router.patch(
  "/users/:id/deactivate",
  verifyToken,
  authorizeRole("admin", "superadmin"),
  userController.deactivateUser,
);

router.patch(
  "/users/:id/activate",
  verifyToken,
  authorizeRole("admin", "superadmin"),
  userController.activateUser,
);

router.post(
  "/companies/:companyId/admins",
  verifyToken,
  authorizeRole("superadmin"),
  validateCreateAdmin,
  userController.createAdminForCompany,
);

module.exports = router;
