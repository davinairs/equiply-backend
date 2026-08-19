const { body, validationResult } = require("express-validator");

const validateCompany = [
  body("companyName")
    .notEmpty()
    .withMessage("Company name is required")
    .isLength({ max: 100 })
    .withMessage("Company name must not exceed 100 characters"),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

const validateUpdateCompany = [
  body("companyName")
    .optional()
    .isLength({ max: 100 })
    .withMessage("Company name must not exceed 100 characters"),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

module.exports = { validateCompany, validateUpdateCompany };
