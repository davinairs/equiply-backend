const { body, validationResult } = require("express-validator");

const validateUnit = [
  body("unitName")
    .notEmpty()
    .withMessage("Unit name is required")
    .isLength({ max: 100 })
    .withMessage("Unit name must not exceed 100 characters"),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

const validateUpdateUnit = [
  body("unitName")
    .optional()
    .isLength({ max: 100 })
    .withMessage("Unit name must not exceed 100 characters"),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

module.exports = {
  validateUnit,
  validateUpdateUnit,
};
