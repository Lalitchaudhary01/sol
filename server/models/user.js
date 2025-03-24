const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String }, // Only required after OTP verification
    otp: { type: String, select: true }, // Allow OTP to be retrieved
    otpExpires: { type: Date, select: true }, // Allow expiry time to be retrieved
    isVerified: { type: Boolean, default: false }, // Verification status
    resetPasswordOTP: {
      type: String,
      select: false,
    },
    resetPasswordExpires: {
      type: Date,
      select: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
