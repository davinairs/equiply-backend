const express = require("express");
const router = express.Router();

const categoryController = require("../controllers/category.controller");
const {
  validateCategory,
  validateUpdateCategory,
} = require("../middlewares/validation/category.validation");
const {
  verifyToken,
  authorizeRole,
} = require("../middlewares/auth.middleware");

router.get("/categories", verifyToken, categoryController.getAllCategories);

router.get("/categories/:id", verifyToken, categoryController.getCategoryById);

router.post(
  "/categories",
  verifyToken,
  authorizeRole("admin"),
  validateCategory,
  categoryController.createCategory,
);

router.put(
  "/categories/:id",
  verifyToken,
  authorizeRole("admin"),
  validateUpdateCategory,
  categoryController.updateCategory,
);

router.delete(
  "/categories/:id",
  verifyToken,
  authorizeRole("admin"),
  categoryController.deleteCategory,
);

module.exports = router;
