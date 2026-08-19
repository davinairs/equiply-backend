const express = require("express");
const router = express.Router();

const equipmentController = require("../controllers/equipment.controller");
const {
  validateEquipment,
  validateUpdateEquipment,
} = require("../middlewares/validation/equipment.validation");
const {
  verifyToken,
  authorizeRole,
} = require("../middlewares/auth.middleware");
const { uploadEquipmentImage } = require("../middlewares/upload.middleware");

router.get("/equipments", verifyToken, equipmentController.getAllEquipments);

router.get(
  "/equipments/:id",
  verifyToken,
  equipmentController.getEquipmentById,
);

router.post(
  "/equipments",
  verifyToken,
  authorizeRole("admin"),
  uploadEquipmentImage.single("equipmentImage"),
  validateEquipment,
  equipmentController.createEquipment,
);

router.put(
  "/equipments/:id",
  verifyToken,
  authorizeRole("admin"),
  uploadEquipmentImage.single("equipmentImage"),
  validateUpdateEquipment,
  equipmentController.updateEquipment,
);

router.delete(
  "/equipments/:id",
  verifyToken,
  authorizeRole("admin"),
  equipmentController.deleteEquipment,
);

module.exports = router;
