const express = require("express");
const rateLimit = require("express-rate-limit");
const { sendDepositNotification } = require("../email/services/emailService");

const router = express.Router();

const emailLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: "Too many email requests from this IP, please try again later",
});

router.post("/deposit/notification", emailLimiter, async (req, res) => {
  const { email, amount, usdValue, txHash } = req.body;

  if (!email || !amount || !usdValue || !txHash) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    await sendDepositNotification(email, amount, usdValue, txHash);
    res.status(200).json({ message: "Email notification sent successfully" });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ error: "Failed to send email notification" });
  }
});

module.exports = router;
