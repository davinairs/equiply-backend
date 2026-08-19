const authService = require("../services/auth.service");

async function login(req, res, next) {
  try {
    const loginData = req.body;

    const result = await authService.login(loginData);

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  login,
};
