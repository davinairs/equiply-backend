const { body, validationResult } = require("express-validator");

const runValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

const validateUser = [
  body("unitId")
    .notEmpty()
    .withMessage("Unit is required")
    .isInt()
    .withMessage("Invalid unit ID"),

  body("username")
    .notEmpty()
    .withMessage("Username is required")
    .isLength({ max: 50 })
    .withMessage("Username must not exceed 50 characters"),

  body("fullName")
    .notEmpty()
    .withMessage("Full name is required")
    .isLength({ max: 100 })
    .withMessage("Full name must not exceed 100 characters"),

  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email format")
    .isLength({ max: 100 })
    .withMessage("Email must not exceed 100 characters"),

  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long"),

  body("profileImage").optional(),

  runValidation,
];

const validateUpdateUser = [
  body("unitId").optional().isInt().withMessage("Invalid unit ID"),

  body("username")
    .optional()
    .isLength({ max: 50 })
    .withMessage("Username must not exceed 50 characters"),

  body("fullName")
    .optional()
    .isLength({ max: 100 })
    .withMessage("Full name must not exceed 100 characters"),

  body("email")
    .optional()
    .isEmail()
    .withMessage("Invalid email format")
    .isLength({ max: 100 })
    .withMessage("Email must not exceed 100 characters"),

  body("profileImage").optional(),

  runValidation,
];

const validateUpdateMyProfile = [
  body("username")
    .optional()
    .isLength({ max: 50 })
    .withMessage("Username must not exceed 50 characters"),

  body("fullName")
    .optional()
    .isLength({ max: 100 })
    .withMessage("Full name must not exceed 100 characters"),

  body("email")
    .optional()
    .isEmail()
    .withMessage("Invalid email format")
    .isLength({ max: 100 })
    .withMessage("Email must not exceed 100 characters"),

  body("profileImage").optional(),

  runValidation,
];

const validateChangePassword = [
  body("oldPassword").notEmpty().withMessage("Old password is required"),

  body("newPassword")
    .notEmpty()
    .withMessage("New password is required")
    .isLength({ min: 8 })
    .withMessage("New password must be at least 8 characters long"),

  runValidation,
];

const validateCreateAdmin = [
  body("username")
    .notEmpty()
    .withMessage("Username is required")
    .isLength({ max: 50 })
    .withMessage("Username must not exceed 50 characters"),

  body("fullName")
    .notEmpty()
    .withMessage("Full name is required")
    .isLength({ max: 100 })
    .withMessage("Full name must not exceed 100 characters"),

  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Email must be a valid email address"),

  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters"),

  runValidation,
];

module.exports = {
  validateUser,
  validateUpdateUser,
  validateUpdateMyProfile,
  validateChangePassword,
  validateCreateAdmin,
};
