const categoryModel = require("../models/category.model");
const AppError = require("../untils/app.error");

async function getAllCategories() {
  return categoryModel.getAllCategories();
}

async function getCategoryById(id) {
  const category = await categoryModel.getCategoryById(id);

  if (!category) {
    throw new AppError("Category not found", 404);
  }

  return category;
}

async function createCategory(categoryData) {
  const { categoryName } = categoryData;

  const existingCategory = await categoryModel.getCategoryByName(categoryName);
  if (existingCategory) {
    throw new AppError("Category already exists", 409);
  }
  return categoryModel.createCategory(categoryData);
}

async function updateCategory(id, categoryData) {
  const { categoryName } = categoryData;

  const category = await categoryModel.getCategoryById(id);
  if (!category) {
    throw new AppError("Category not found", 404);
  }

  if ("id" in categoryData) {
    throw new AppError("ID cannot be changed", 400);
  }

  if ("createdAt" in categoryData) {
    throw new AppError("Created At cannot be changed", 400);
  }

  if ("updatedAt" in categoryData) {
    throw new AppError("Updated At cannot be changed", 400);
  }

  if (categoryName) {
    const existingCategory =
      await categoryModel.getCategoryByName(categoryName);

    if (existingCategory && existingCategory.id !== Number(id)) {
      throw new AppError("Category name is already in use", 409);
    }
  }

  return categoryModel.updateCategory(id, categoryData);
}

async function deleteCategory(id) {
  const category = await categoryModel.getCategoryById(id);

  if (!category) {
    throw new AppError("Category not found", 404);
  }

  const relatedEquipments = await categoryModel.getEquipmentsByCategoryId(id);

  if (relatedEquipments.length > 0) {
    throw new AppError(
      "Category cannot be deleted because it is still being used by equipments",
      409,
    );
  }

  return categoryModel.deleteCategory(id);
}

module.exports = {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};