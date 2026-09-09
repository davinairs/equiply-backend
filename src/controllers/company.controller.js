const companyService = require("../services/company.service");

async function getAllCompanies(req, res, next) {
  try {
    const companies = await companyService.getAllCompanies(req.user);
    res.json(companies);
  } catch (error) {
    next(error);
  }
}

async function getCompanyById(req, res, next) {
  try {
    const { id } = req.params;
    const company = await companyService.getCompanyById(id, req.user);
    res.json(company);
  } catch (error) {
    next(error);
  }
}

async function createCompany(req, res, next) {
  try {
    const company = await companyService.createCompany(req.body, req.user);
    res
      .status(201)
      .json({ message: "Company created successfully", data: company });
  } catch (error) {
    next(error);
  }
}

async function updateCompany(req, res, next) {
  try {
    const { id } = req.params;
    const company = await companyService.updateCompany(id, req.body, req.user);
    res
      .status(200)
      .json({ message: "Company updated successfully", data: company });
  } catch (error) {
    next(error);
  }
}

async function deleteCompany(req, res, next) {
  try {
    const { id } = req.params;
    await companyService.deleteCompany(id, req.user);
    res.status(200).json({ message: "Company deleted successfully" });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAllCompanies,
  getCompanyById,
  createCompany,
  updateCompany,
  deleteCompany,
};
