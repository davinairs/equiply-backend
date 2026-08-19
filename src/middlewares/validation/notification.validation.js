const { body, validationResult } = require("express-validator");

const validateNotification = [
  body("userId")
    .notEmpty()
    .withMessage("User is required")
    .isInt()
    .withMessage("Invalid user ID"),

  body("borrowRequestId")
    .optional()
    .isInt()
    .withMessage("Invalid borrow request ID"),

  body("title")
    .notEmpty()
    .withMessage("Title is required")
    .isLength({ max: 100 })
    .withMessage("Title must not exceed 100 characters"),

  body("message")
    .notEmpty()
    .withMessage("Message is required")
    .isLength({ max: 500 })
    .withMessage("Message must not exceed 500 characters"),

  (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    next();
  },
];

const validateUpdateNotification = [
  body("isRead").isBoolean().withMessage("isRead must be a boolean value (true or false)"),

  (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
      });
    }

    next();
  },
];

module.exports = {
  validateNotification,
  validateUpdateNotification,
};