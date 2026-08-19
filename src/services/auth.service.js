const userModel = require("../models/user.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const AppError = require("../untils/app.error");

async function login(loginData) {
  const { email, password } = loginData;

  const user = await userModel.getUserByEmail(email);

  if (!user) {
    throw new AppError("Invalid email or password", 401);
  }

  if (user.status !== "active") {
    throw new AppError("inactive account", 403);
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new AppError("Invalid email or password", 401);
  }

  const token = jwt.sign(
    {
      id: user.id,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "1d",
    },
  );

  return {
    message: "Login berhasil",
    token,
    user: {
      id: user.id,
      companyId: user.companyId,
      username: user.username,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
    },
  };
}

module.exports = {
  login,
};
