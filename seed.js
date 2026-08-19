const bcrypt = require("bcrypt");
const db = require("./src/config/database");

async function seed() {
  try {
    console.log("Mulai seeding...");

    await db.query("SET FOREIGN_KEY_CHECKS = 0");
    await db.query("TRUNCATE TABLE notifications");
    await db.query("TRUNCATE TABLE borrow_requests");
    await db.query("TRUNCATE TABLE equipments");
    await db.query("TRUNCATE TABLE categories");
    await db.query("TRUNCATE TABLE users");
    await db.query("TRUNCATE TABLE companies");
    await db.query("SET FOREIGN_KEY_CHECKS = 1");
    console.log("Data lama dibersihkan");

    // users.companyId NOT NULL, jadi admin tetap butuh 1 company
    const [companyResult] = await db.query(
      `INSERT INTO companies (companyName) VALUES (?)`,
      ["Equiply HQ"]
    );
    const companyId = companyResult.insertId;
    console.log("Company dibuat, id:", companyId);

    const adminPassword = await bcrypt.hash("admin123", 10);
    const [adminResult] = await db.query(
      `INSERT INTO users (companyId, username, fullName, email, password, role)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [companyId, "admin1", "Admin Satu", "admin@equiply.com", adminPassword, "admin"]
    );
    console.log(
      "Admin dibuat, id:",
      adminResult.insertId,
      "| login: admin@equiply.com / admin123"
    );

    console.log("\n✅ Seeding selesai! Database bersih, cuma ada 1 admin.");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding gagal:", error);
    process.exit(1);
  }
}

seed();