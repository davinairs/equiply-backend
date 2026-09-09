require("dotenv").config();
require("./corn/borrowCorn");

const app = require("./app");
const db = require("./config/database");


const PORT = process.env.PORT || 8080;

async function testConnection() {
  try {
    const connection = await db.getConnection();
    console.log("Success");
    connection.release();
  } catch (err) {
    console.log("Unsuccessful");
    console.log(err.message);
  }
}

testConnection();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
