const equipmentService = require("../services/equipment.service");

async function getAllEquipments(req, res, next) {
  try {
    const equipments = await equipmentService.getAllEquipments();
    res.json(equipments);
  } catch (error) {
    next(error);
  }
}

async function getEquipmentById(req, res, next) {
  try {
    const { id } = req.params;
    const equipment = await equipmentService.getEquipmentById(id);
    res.json(equipment);
  } catch (error) {
    next(error);
  }
}

async function createEquipment(req, res, next) {
  try {
    const equipmentData = { ...req.body };

    if (req.file) {
      equipmentData.equipmentImage = req.file.path;
    }

    const equipment = await equipmentService.createEquipment(equipmentData);
    res.status(201).json({ message: "Equipment created successfully", data: equipment });
  } catch (error) {
    next(error);
  }
}

async function updateEquipment(req, res, next) {
  try {
    const { id } = req.params;
    const equipmentData = { ...req.body };

    if (req.file) {
      equipmentData.equipmentImage = req.file.path;
    }

    const equipment = await equipmentService.updateEquipment(id, equipmentData);
    res.status(200).json({ message: "Equipment updated successfully", data: equipment });
  } catch (error) {
    next(error);
  }
}

async function deleteEquipment(req, res, next) {
  try {
    const { id } = req.params;
    await equipmentService.deleteEquipment(id);

    res.status(200).json({
      message: "Equipment deleted successfully",
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAllEquipments,
  getEquipmentById,
  createEquipment,
  updateEquipment,
  deleteEquipment,
};