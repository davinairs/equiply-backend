const express = require("express");
const router = express.Router();

const companyController = require("../controllers/company.controller");
const {
  validateCompany,
  validateUpdateCompany,
} = require("../middlewares/validation/company.validation");
const {
  verifyToken,
  authorizeRole,
} = require("../middlewares/auth.middleware");

router.get(
  "/companies",
  verifyToken,
  authorizeRole("admin"),
  companyController.getAllCompanies,
);

router.get(
  "/companies/:id",
  verifyToken,
  authorizeRole("admin"),
  companyController.getCompanyById,
);

router.post(
  "/companies",
  verifyToken,
  authorizeRole("admin"),
  validateCompany,
  companyController.createCompany,
);

router.put(
  "/companies/:id",
  verifyToken,
  authorizeRole("admin"),
  validateUpdateCompany,
  companyController.updateCompany,
);

router.delete(
  "/companies/:id",
  verifyToken,
  authorizeRole("admin"),
  companyController.deleteCompany,
);

module.exports = router;
