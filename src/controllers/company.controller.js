const companyService = require("../services/company.service");

async function getAllCompanies(req, res, next) {
  try {
    const companies = await companyService.getAllCompanies();

    res.json(companies);
  } catch (error) {
    next(error);
  }
}

async function getCompanyById(req, res, next) {
  try {
    const { id } = req.params;

    const company = await companyService.getCompanyById(id);

    res.json(company);
  } catch (error) {
    next(error);
  }
}

async function createCompany(req, res, next) {
  try {
    const companyData = req.body;

    const company = await companyService.createCompany(companyData);

    res.status(201).json({ message: "Company created successfully", data: company });
  } catch (error) {
    next(error);
  }
}

async function updateCompany(req, res, next) {
  try {
    const { id } = req.params;
    const companyData = req.body;

    const company = await companyService.updateCompany(id, companyData);

    res.status(200).json({ message: "Company updated successfully", data: company });
  } catch (error) {
    next(error);
  }
}

async function deleteCompany(req, res, next) {
  try {
    const { id } = req.params;

    await companyService.deleteCompany(id);

    res.status(200).json({
      message: "Company deleted successfully",
    });
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