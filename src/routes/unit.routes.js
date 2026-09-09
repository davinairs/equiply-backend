const express = require("express");
const router = express.Router();

const unitController = require("../controllers/unit.controller");
const { validateUnit, validateUpdateUnit } = require("../middlewares/validation/unit.validation");
const { verifyToken, authorizeRole } = require("../middlewares/auth.middleware");

router.get(
  "/units",
  verifyToken,
  authorizeRole("admin"),
  unitController.getMyCompanyUnits,
);

router.get(
  "/units/:id",
  verifyToken,
  authorizeRole("admin"),
  unitController.getUnitById,
);

router.post(
  "/units",
  verifyToken,
  authorizeRole("admin"),
  validateUnit,
  unitController.createUnit,
);

router.put(
  "/units/:id",
  verifyToken,
  authorizeRole("admin"),
  validateUpdateUnit,
  unitController.updateUnit,
);

router.delete(
  "/units/:id",
  verifyToken,
  authorizeRole("admin"),
  unitController.deleteUnit,
);

module.exports = router;
