const express = require("express");
const router = express.Router();
const uploadFile = require("../utils/dailyService").uploadFile;

router.get("/", async (req, res) => {
  try {
    await uploadFile();
    res.status(200).json({ success: true, message: "Daily image uploaded ✅" });
  } catch (err) {
    console.error("❌ Cron job failed:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
