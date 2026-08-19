const jwt = require("jsonwebtoken");
const userModel = require("../models/user.model");

async function verifyToken(req, res, next) {
  const authHeader = req.header("Authorization");
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res
      .status(401)
      .json({ message: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await userModel.getUserById(decoded.id);
    if (!user || user.status !== "active") {
      return res
        .status(401)
        .json({ message: "Account is inactive or could not be found." });
    }

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token." });
  }
}

function authorizeRole(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: "Forbidden. You don't have permission.",
      });
    }
    next();
  };
}

module.exports = {
  verifyToken,
  authorizeRole,
};
