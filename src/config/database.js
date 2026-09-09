require("dotenv").config();

const mysql = require("mysql2/promise");

const db = mysql.createPool({
  host: process.env.DB_HOST || process.env.MYSQLHOST,
  port: Number(process.env.DB_PORT || process.env.MYSQLPORT),
  user: process.env.DB_USER || process.env.MYSQLUSER,
  password: process.env.DB_PASSWORD || process.env.MYSQLPASSWORD,
  database: process.env.DB_NAME || process.env.MYSQL_DATABASE,
  dateStrings: true,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  timezone: '+07:00',
});

db.on('connection', (connection) => {
  connection.query("SET time_zone = '+07:00'");
});

module.exports = db;