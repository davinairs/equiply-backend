const { body, validationResult } = require("express-validator");

const validateEquipment = [
  body("equipmentName")
    .notEmpty()
    .withMessage("Equipment name is required")
    .isLength({ max: 100 })
    .withMessage("Equipment name must not exceed 100 characters"),

  body("serialNumber")
    .notEmpty()
    .withMessage("Serial number is required")
    .isLength({ max: 50 })
    .withMessage("Serial number must not exceed 50 characters"),

  body("categoryId")
    .notEmpty()
    .withMessage("Category is required")
    .isInt()
    .withMessage("Invalid category ID"),

  body("location")
    .optional()
    .isLength({ max: 255 })
    .withMessage("Location must not exceed 255 characters"),

  body("equipmentImage").optional(),

  body("equipmentCondition")
    .notEmpty()
    .withMessage("Condition is required")
    .isIn(["new", "good", "broken"])
    .withMessage("Invalid condition value"),

  body("description")
    .optional()
    .isLength({ max: 500 })
    .withMessage("Description must not exceed 500 characters"),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

const validateUpdateEquipment = [
  body("equipmentName")
    .optional()
    .isLength({ max: 100 })
    .withMessage("Equipment name must not exceed 100 characters"),

  body("categoryId").optional().isInt().withMessage("Invalid category ID"),

  body("location")
    .optional()
    .isLength({ max: 255 })
    .withMessage("Location must not exceed 255 characters"),

  body("equipmentImage").optional(),

  body("equipmentCondition")
    .optional()
    .isIn(["new", "good", "broken"])
    .withMessage("Invalid condition value"),

  body("description")
    .optional()
    .isLength({ max: 500 })
    .withMessage("Description must not exceed 500 characters"),

  body("equipmentStatus")
    .optional()
    .isIn(["available", "maintenance"])
    .withMessage("Invalid status value"),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

module.exports = {
  validateEquipment,
  validateUpdateEquipment,
};
