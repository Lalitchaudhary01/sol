const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const auth = require("../middleware/auth");
const User = require("../models/User"); // Add this import

// Update user profile (protected route)
router.put("/profile", auth, authController.updateProfile);

// Verify new email with OTP (protected route)
router.post("/verify-new-email", auth, authController.verifyNewEmail);

// Get user profile (protected route)
router.get("/profile", auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      name: user.name,
      email: user.email,
    });
  } catch (error) {
    console.error("❌ Get Profile Error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

module.exports = router;
