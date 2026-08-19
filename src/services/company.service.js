const companyModel = require("../models/company.model");
const AppError = require("../untils/app.error");

async function getAllCompanies() {
  return companyModel.getAllCompanies();
}

async function getCompanyById(id) {
  const company = await companyModel.getCompanyById(id);

  if (!company) {
    throw new AppError("Company not found", 404);
  }

  return company;
}

async function createCompany(companyData) {
  const { companyName } = companyData;

  const existingCompany = await companyModel.getCompanyByName(companyName);

  if (existingCompany) {
    throw new AppError("Company already exists", 409);
  }

  return companyModel.createCompany(companyData);
}

async function updateCompany(id, companyData) {
  const { companyName } = companyData;

  const company = await companyModel.getCompanyById(id);

  if (!company) {
    throw new AppError("Company not found", 404);
  }

  if ("id" in companyData) {
    throw new AppError("ID cannot be changed", 400);
  }

  if ("createdAt" in companyData) {
    throw new AppError("Created At cannot be changed", 400);
  }

  if ("updatedAt" in companyData) {
    throw new AppError("Updated At cannot be changed", 400);
  }

  if (companyName) {
    const existingCompany = await companyModel.getCompanyByName(companyName);

    if (existingCompany && existingCompany.id !== Number(id)) {
      throw new AppError("Company name is already in use", 409);
    }
  }

  return companyModel.updateCompany(id, companyData);
}

async function deleteCompany(id) {
  const company = await companyModel.getCompanyById(id);

  if (!company) {
    throw new AppError("Company not found", 404);
  }

  const relatedUsers = await companyModel.getUsersByCompanyId(id);

  if (relatedUsers.length > 0) {
    throw new AppError(
      "Company cannot be deleted because it still has registered users",
      409,
    );
  }

  return companyModel.deleteCompany(id);
}

module.exports = {
  getAllCompanies,
  getCompanyById,
  createCompany,
  updateCompany,
  deleteCompany,
};