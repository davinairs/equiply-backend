const categoryService = require("../services/category.service");

async function getAllCategories(req, res, next) {
  try {
    const categories = await categoryService.getAllCategories();

    res.json(categories);
  } catch (error) {
    next(error);
  }
}

async function getCategoryById(req, res, next) {
  try {
    const { id } = req.params;

    const category = await categoryService.getCategoryById(id);

    res.json(category);
  } catch (error) {
    next(error);
  }
}

async function createCategory(req, res, next) {
  try {
    const categoryData = req.body;

    const category = await categoryService.createCategory(categoryData);

    res.status(201).json(category);
  } catch (error) {
    next(error);
  }
}

async function updateCategory(req, res, next) {
  try {
    const { id } = req.params;
    const categoryData = req.body;

    const category = await categoryService.updateCategory(id, categoryData);

    res.status(200).json(category);
  } catch (error) {
    next(error);
  }
}

async function deleteCategory(req, res, next) {
  try {
    const { id } = req.params;

    await categoryService.deleteCategory(id);

    res.status(200).json({
      message: "Category berhasil dihapus",
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};
