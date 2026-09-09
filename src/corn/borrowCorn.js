const cron = require("node-cron");
const borrowRequestService = require("../services/borrowrequest.service");

cron.schedule("0 0 * * * *", async () => {
  console.log("--- Running scheduled job: check borrow reminders ---");
  try {
    await borrowRequestService.checkAndSendReminders();
    console.log("Reminder check completed.");
  } catch (error) {
    console.error("Failed to run borrow reminder cron job:", error);
  }
});

module.exports = {};