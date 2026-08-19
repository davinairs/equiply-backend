const equipmentModel = require("../models/equipment.model");
const categoryModel = require("../models/category.model");
const borrowRequestModel = require("../models/borrowrequest.model");
const AppError = require("../untils/app.error");

async function getAllEquipments() {
  return equipmentModel.getAllEquipments();
}

async function getEquipmentById(id) {
  const equipment = await equipmentModel.getEquipmentById(id);

  if (!equipment) {
    throw new AppError("Equipment not found", 404);
  }

  return equipment;
}

async function createEquipment(equipmentData) {
  const { serialNumber, categoryId } = equipmentData;

  const existingEquipment =
    await equipmentModel.getEquipmentBySerialNumber(serialNumber);

  if (existingEquipment) {
    throw new AppError("Serial number is already in use", 409);
  }

  const category = await categoryModel.getCategoryById(categoryId);

  if (!category) {
    throw new AppError("Category not found", 404);
  }

  return equipmentModel.createEquipment(equipmentData);
}

async function updateEquipment(id, equipmentData) {
  const { categoryId, equipmentStatus } = equipmentData;

  const equipment = await equipmentModel.getEquipmentById(id);

  if (!equipment) {
    throw new AppError("Equipment not found", 404);
  }

  if ("serialNumber" in equipmentData) {
    throw new AppError("Serial Number cannot be changed", 400);
  }

  if ("id" in equipmentData) {
    throw new AppError("ID cannot be changed", 400);
  }

  if ("createdAt" in equipmentData) {
    throw new AppError("Created At cannot be changed", 400);
  }

  if ("updatedAt" in equipmentData) {
    throw new AppError("Updated At cannot be changed", 400);
  }

  if (categoryId) {
    const category = await categoryModel.getCategoryById(categoryId);

    if (!category) {
      throw new AppError("Category not found", 404);
    }
  }

  if ("equipmentStatus" in equipmentData) {
    if (!["available", "borrowed", "maintenance"].includes(equipmentStatus)) {
      throw new AppError("Invalid status", 400);
    }

    if (
      equipmentStatus !== equipment.equipmentStatus &&
      equipment.equipmentStatus === "borrowed"
    ) {
      throw new AppError(
        "Status cannot be changed because the equipment is currently borrowed",
        409,
      );
    }
  }

  return equipmentModel.updateEquipment(id, equipmentData);
}

async function deleteEquipment(id) {
  const equipment = await equipmentModel.getEquipmentById(id);

  if (!equipment) {
    throw new AppError("Equipment not found", 404);
  }

  if (equipment.equipmentStatus === "borrowed") {
    throw new AppError(
      "Equipment cannot be deleted because it is currently borrowed",
      400,
    );
  }

  const relatedRequests =
    await equipmentModel.getBorrowRequestsByEquipmentId(id);

  if (relatedRequests.length > 0) {
    throw new AppError(
      "Equipment cannot be deleted because it has borrowing history",
      409,
    );
  }

  return equipmentModel.deleteEquipment(id);
}

module.exports = {
  getAllEquipments,
  getEquipmentById,
  createEquipment,
  updateEquipment,
  deleteEquipment,
};