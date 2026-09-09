const unitModel = require("../models/unit.model");
const AppError = require("../untils/app.error");

function assertCompanyAccess(currentUser, resourceCompanyId) {
  if (currentUser.companyId !== resourceCompanyId) {
    throw new AppError("Forbidden. You can only access units in your own company.", 403);
  }
}

async function getMyCompanyUnits(currentUser) {
  return unitModel.getUnitsByCompanyId(currentUser.companyId);
}

async function getUnitById(id, currentUser) {
  const unit = await unitModel.getUnitById(id);

  if (!unit) {
    throw new AppError("Unit not found", 404);
  }

  assertCompanyAccess(currentUser, unit.companyId);

  return unit;
}

async function createUnit(unitData, currentUser) {
  const { unitName } = unitData;
  const companyId = currentUser.companyId;

  const existingUnit = await unitModel.getUnitByNameInCompany(
    companyId,
    unitName,
  );
  if (existingUnit) {
    throw new AppError("Unit name already exists in this company", 409);
  }

  return unitModel.createUnit({ ...unitData, companyId });
}

async function updateUnit(id, unitData, currentUser) {
  const unit = await unitModel.getUnitById(id);

  if (!unit) {
    throw new AppError("Unit not found", 404);
  }

  assertCompanyAccess(currentUser, unit.companyId);

  if ("id" in unitData) {
    throw new AppError("ID cannot be changed", 400);
  }
  if ("companyId" in unitData) {
    throw new AppError("Unit cannot be moved to a different company", 400);
  }
  if ("createdAt" in unitData) {
    throw new AppError("Created At cannot be changed", 400);
  }
  if ("updatedAt" in unitData) {
    throw new AppError("Updated At cannot be changed", 400);
  }

  const { unitName } = unitData;

  if (unitName) {
    const existingUnit = await unitModel.getUnitByNameInCompany(
      unit.companyId,
      unitName,
    );

    if (existingUnit && existingUnit.id !== Number(id)) {
      throw new AppError("Unit name already exists in this company", 409);
    }
  }

  return unitModel.updateUnit(id, unitData);
}

async function deleteUnit(id, currentUser) {
  const unit = await unitModel.getUnitById(id);

  if (!unit) {
    throw new AppError("Unit not found", 404);
  }

  assertCompanyAccess(currentUser, unit.companyId);

  const relatedUsers = await unitModel.getUsersByUnitId(id);

  if (relatedUsers.length > 0) {
    throw new AppError("Unit cannot be deleted because it still has registered users", 409);
  }

  return unitModel.deleteUnit(id);
}

module.exports = {
  getMyCompanyUnits,
  getUnitById,
  createUnit,
  updateUnit,
  deleteUnit,
};
