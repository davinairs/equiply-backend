const equipmentModel = require("../models/equipment.model");
const categoryModel = require("../models/category.model");
const AppError = require("../untils/app.error");

function assertCompanyAccess(currentUser, resourceCompanyId) {
  if (currentUser.companyId !== resourceCompanyId) {
    throw new AppError("Forbidden. You can only access equipment in your own company.", 403);
  }
}

async function getAllEquipments(currentUser) {
  return equipmentModel.getAllEquipments(currentUser.companyId);
}

async function getEquipmentById(id, currentUser) {
  const equipment = await equipmentModel.getEquipmentById(id);

  if (!equipment) {
    throw new AppError("Equipment not found", 404);
  }

  assertCompanyAccess(currentUser, equipment.companyId);

  return equipment;
}

async function createEquipment(equipmentData, currentUser) {
  const { serialNumber, categoryId } = equipmentData;
  const companyId = currentUser.companyId; 

  const existingEquipment =
    await equipmentModel.getEquipmentBySerialNumber(serialNumber);
  if (existingEquipment) {
    throw new AppError("Serial number is already in use", 409);
  }

  const category = await categoryModel.getCategoryById(categoryId);
  if (!category || category.companyId !== companyId) {
    throw new AppError("Category not found", 404);
  }

  return equipmentModel.createEquipment({ ...equipmentData, companyId });
}

async function updateEquipment(id, equipmentData, currentUser) {
  const { categoryId, equipmentStatus, equipmentCondition } = equipmentData;

  const equipment = await equipmentModel.getEquipmentById(id);
  if (!equipment) {
    throw new AppError("Equipment not found", 404);
  }

  assertCompanyAccess(currentUser, equipment.companyId);

  if (categoryId) {
    const category = await categoryModel.getCategoryById(categoryId);
    if (!category || category.companyId !== equipment.companyId) {
      throw new AppError("Category not found", 404);
    }
  }

  if ("equipmentStatus" in equipmentData) {
    if (!["available", "maintenance"].includes(equipmentStatus)) {
      throw new AppError("Status can only be manually set to 'available' or 'maintenance'. 'Borrowed' is managed automatically by the borrow request flow.", 400);
    }
    if (equipment.equipmentStatus === "borrowed") {
      throw new AppError("Status cannot be changed because the equipment is currently borrowed", 409);
    }
  }

  const updateData = { ...equipmentData };

  if (equipmentCondition === "broken") {
    if (equipment.equipmentStatus === "borrowed") {
      throw new AppError("Cannot mark as broken while equipment is currently borrowed. Ask the borrower to return it first.", 409);
    }
    updateData.equipmentStatus = "maintenance";
  }

  return equipmentModel.updateEquipment(id, updateData);
}

async function deleteEquipment(id, currentUser) {
  const equipment = await equipmentModel.getEquipmentById(id);

  if (!equipment) {
    throw new AppError("Equipment not found", 404);
  }

  assertCompanyAccess(currentUser, equipment.companyId);

  if (equipment.equipmentStatus === "borrowed") {
    throw new AppError("Equipment cannot be deleted because it is currently borrowed", 400);
  }

  const relatedRequests =
    await equipmentModel.getBorrowRequestsByEquipmentId(id);

  if (relatedRequests.length > 0) {
    throw new AppError("Equipment cannot be deleted because it has borrowing history", 409);
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
