const { body, validationResult } = require("express-validator");

const runValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

const validateBorrowRequest = [
  body("equipmentId")
    .notEmpty()
    .withMessage("Equipment is required")
    .isInt()
    .withMessage("Invalid equipment ID"),

  body("borrowDate")
    .notEmpty()
    .withMessage("Borrow date is required")
    .isDate()
    .withMessage("Invalid borrow date format"),

  body("reason")
    .optional()
    .isLength({ max: 500 })
    .withMessage("Reason must not exceed 500 characters"),

  runValidation,
];

const validateApproveBorrowRequest = [
  body("dueDate")
    .notEmpty()
    .withMessage("Due date is required")
    .isDate()
    .withMessage("Invalid due date format"),

  runValidation,
];

module.exports = {
  validateBorrowRequest,
  validateApproveBorrowRequest,
};