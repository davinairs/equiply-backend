const AppError = require("../untils/app.error");

const errorHandler = (err, req, res, next) => {
  console.error(err);

  const isOperationalError = err instanceof AppError;
  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    success: false,
    status: err.status || "error",
    message: isOperationalError ? err.message : "Internal Server Error",
  });
};

module.exports = errorHandler;
