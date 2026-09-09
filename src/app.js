const express = require("express");
const cors = require("cors");

const logger = require("./middlewares/logger.middleware");
const authRoutes = require("./routes/auth.routes");
const companyRoutes = require("./routes/company.routes");
const categoryRoutes = require("./routes/category.routes");
const equipmentRoutes = require("./routes/equipment.routes");
const userRoutes = require("./routes/user.routes");
const borrowRequestRoutes = require("./routes/borrowrequest.routes");
const notificationRoutes = require("./routes/notification.routes");
const unitRoutes  = require("./routes/unit.routes");
const errorHandler = require("./middlewares/error.handler");

const app = express();

app.use(cors({
  origin: ["https://equiply-frontend.vercel.app", "http://localhost:5173"],
  credentials: true,
}));

app.use(express.json());

app.use(logger);
app.use(authRoutes);
app.use(companyRoutes);
app.use(unitRoutes);
app.use(categoryRoutes);
app.use(equipmentRoutes);
app.use(userRoutes);
app.use(borrowRequestRoutes);
app.use(notificationRoutes);
app.use(errorHandler);

module.exports = app;
