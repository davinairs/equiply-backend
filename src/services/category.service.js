const categoryModel = require("../models/category.model");
const AppError = require("../untils/app.error");

function assertCompanyAccess(currentUser, resourceCompanyId) {
  if (currentUser.companyId !== resourceCompanyId) {
    throw new AppError("Forbidden. You can only access categories in your own company.", 403);
  }
}

async function getAllCategories(currentUser) {
  return categoryModel.getAllCategories(currentUser.companyId);
}

async function getCategoryById(id, currentUser) {
  const category = await categoryModel.getCategoryById(id);

  if (!category) {
    throw new AppError("Category not found", 404);
  }

  assertCompanyAccess(currentUser, category.companyId);

  return category;
}

async function createCategory(categoryData, currentUser) {
  const { categoryName } = categoryData;
  const companyId = currentUser.companyId;

  const existingCategory = await categoryModel.getCategoryByNameInCompany(
    companyId,
    categoryName,
  );
  if (existingCategory) {
    throw new AppError("Category already exists", 409);
  }
  
  return categoryModel.createCategory({ ...categoryData, companyId });
}

async function updateCategory(id, categoryData, currentUser) {
  const { categoryName } = categoryData;

  const category = await categoryModel.getCategoryById(id);
  if (!category) {
    throw new AppError("Category not found", 404);
  }

  assertCompanyAccess(currentUser, category.companyId);

  if ("id" in categoryData) {
    throw new AppError("ID cannot be changed", 400);
  }

  if ("companyId" in categoryData) {
    throw new AppError("Category cannot be moved to a different company", 400);
  }

  if ("createdAt" in categoryData) {
    throw new AppError("Created At cannot be changed", 400);
  }

  if ("updatedAt" in categoryData) {
    throw new AppError("Updated At cannot be changed", 400);
  }

  if (categoryName) {
    const existingCategory = await categoryModel.getCategoryByNameInCompany(
      category.companyId,
      categoryName,
    );

    if (existingCategory && existingCategory.id !== Number(id)) {
      throw new AppError("Category name is already in use", 409);
    }
  }

  return categoryModel.updateCategory(id, categoryData);
}

async function deleteCategory(id, currentUser) {
  const category = await categoryModel.getCategoryById(id);

  if (!category) {
    throw new AppError("Category not found", 404);
  }

  assertCompanyAccess(currentUser, category.companyId);

  const relatedEquipments = await categoryModel.getEquipmentsByCategoryId(id);

  if (relatedEquipments.length > 0) {
    throw new AppError("Category cannot be deleted because it is still being used by equipments", 409);
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
