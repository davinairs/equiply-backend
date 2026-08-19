require("dotenv").config();

const app = require("./app");
const db = require("./config/database");

const PORT = process.env.PORT || 15390;

async function testConnection() {
  try {
    await db.getConnection();
    console.log("Success");
  } catch (err) {
    console.log("Unsuccessful");
    console.log(err.message);
  }
}

testConnection();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
