const express = require("express");
const router = express.Router();

const companyController = require("../controllers/company.controller");
const { validateCompany, validateUpdateCompany } = require("../middlewares/validation/company.validation");
const { verifyToken, authorizeRole } = require("../middlewares/auth.middleware");

router.get(
  "/companies",
  verifyToken,
  authorizeRole("superadmin"),
  companyController.getAllCompanies,
);

router.get(
  "/companies/:id",
  verifyToken,
  authorizeRole("superadmin", "admin"),
  companyController.getCompanyById,
);

router.post(
  "/companies",
  verifyToken,
  authorizeRole("superadmin"),
  validateCompany,
  companyController.createCompany,
);

router.put(
  "/companies/:id",
  verifyToken,
  authorizeRole("superadmin"),
  validateUpdateCompany,
  companyController.updateCompany,
);

router.delete(
  "/companies/:id",
  verifyToken,
  authorizeRole("superadmin"),
  companyController.deleteCompany,
);

module.exports = router;
