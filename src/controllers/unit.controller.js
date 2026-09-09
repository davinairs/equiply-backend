const unitService = require("../services/unit.service");

async function getMyCompanyUnits(req, res, next) {
  try {
    const units = await unitService.getMyCompanyUnits(req.user);
    res.json(units);
  } catch (err) {
    next(err);
  }
}

async function getUnitById(req, res, next) {
  try {
    const unit = await unitService.getUnitById(req.params.id, req.user);
    res.json(unit);
  } catch (err) {
    next(err);
  }
}

async function createUnit(req, res, next) {
  try {
    const unit = await unitService.createUnit(req.body, req.user);
    res.status(201).json(unit);
  } catch (err) {
    next(err);
  }
}

async function updateUnit(req, res, next) {
  try {
    const updated = await unitService.updateUnit(
      req.params.id,
      req.body,
      req.user,
    );
    res.json(updated);
  } catch (err) {
    next(err);
  }
}

async function deleteUnit(req, res, next) {
  try {
    await unitService.deleteUnit(req.params.id, req.user);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getMyCompanyUnits,
  getUnitById,
  createUnit,
  updateUnit,
  deleteUnit,
};
