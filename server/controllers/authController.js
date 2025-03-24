require("dotenv").config();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

// Setup Nodemailer Transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Generate a 6-digit OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send OTP Email
async function sendOTP(email, otp) {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "StakeSol - Verify Your Account",
    html: `
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; color: #333; text-align: center; padding: 20px; }
          .container { max-width: 500px; margin: auto; padding: 25px; }
          .otp { font-size: 26px; font-weight: bold; color: #8E76FF; margin: 20px auto; padding: 10px; border-bottom: 2px solid #00FFA3; display: inline-block; }
          .footer { font-size: 14px; color: #777; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <h2 style="color: #222;">Verify Your StakeSol Account</h2>
          <p style="color: #555;">Your OTP is valid for 10 minutes.</p>
          <div class="otp">${otp}</div>
          <p style="color: #777;">If you didn't request this, ignore this email.</p>
        </div>
      </body>
      </html>
    `,
  });
}

// User Pre-Registration - Only collect info and send OTP
exports.register = async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    // Check if user already exists
    let existingUser = await User.findOne({ email });
    if (existingUser && existingUser.isVerified) {
      return res.status(400).json({ message: "User already exists." });
    }

    // If a pending verification exists, update it instead of creating new
    if (existingUser && !existingUser.isVerified) {
      // Update the existing unverified user with new information
      const otp = generateOTP();
      const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      existingUser.name = name;
      existingUser.password = hashedPassword;
      existingUser.otp = otp;
      existingUser.otpExpires = otpExpires;

      await existingUser.save();
      await sendOTP(email, otp);

      return res.status(200).json({
        message: "OTP sent to email. Verify to complete registration.",
        email: email,
      });
    }

    // For new users, store their info in temporary pre-registration
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    // Hash password before saving
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create a new user with isVerified = false
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      otp,
      otpExpires,
      isVerified: false,
    });

    await newUser.save();
    await sendOTP(email, otp);

    return res.status(201).json({
      message: "OTP sent to email. Verify to complete registration.",
      email: email,
    });
  } catch (error) {
    console.error("❌ Registration Error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Verify OTP and complete registration
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email }).select("+otp +otpExpires");

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // Ensure OTP exists
    if (!user.otp) {
      return res
        .status(400)
        .json({ message: "No OTP found. Please request a new one." });
    }

    // Convert both OTPs to strings and trim spaces before comparing
    if (user.otp.toString().trim() !== otp.toString().trim()) {
      return res
        .status(400)
        .json({ message: "Invalid OTP. Please try again." });
    }

    // Fix expiration check
    if (new Date(user.otpExpires) < new Date()) {
      return res
        .status(400)
        .json({ message: "OTP has expired. Please request a new one." });
    }

    // Mark user as verified and clear OTP fields
    user.isVerified = true;
    user.otp = null;
    user.otpExpires = null;
    await user.save();

    // Generate token for automatic login after verification
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    return res.status(200).json({
      message: "Account verified successfully",
      token,
      user: {
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("❌ Error in verifyOTP:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select(
      "+password +otp +otpExpires"
    );

    if (!user) {
      return res.status(400).json({ message: "Account does not exist." });
    }

    if (!user.password) {
      return res
        .status(400)
        .json({ message: "Password not set. Try resetting your password." });
    }

    if (!user.isVerified) {
      const newOTP = generateOTP();
      user.otp = newOTP;
      user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
      await user.save();

      await sendOTP(email, newOTP);
      return res.status(401).json({
        message: "Your account is not verified. OTP has been sent.",
        redirectTo: "verifyOTP", // Frontend should navigate to OTP verification page
        email: user.email, // Include email so the frontend can autofill it
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is missing in environment variables");
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    return res.json({
      token,
      message: "Login successful",
      user: {
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("❌ Login Error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Resend OTP
exports.resendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(400).json({ message: "User not found" });

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    await sendOTP(email, otp);

    return res.json({ message: "New OTP sent" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Logout (Client handles token removal)
exports.logout = (req, res) => res.json({ message: "Logged out successfully" });

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate reset token (OTP)
    const resetOTP = generateOTP();
    user.resetPasswordOTP = resetOTP;
    user.resetPasswordExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    await user.save();

    // Send reset password email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "StakeSol - Reset Your Password",
      html: `
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; color: #333; text-align: center; padding: 20px; }
            .container { max-width: 500px; margin: auto; padding: 25px; }
            .otp { font-size: 26px; font-weight: bold; color: #8E76FF; margin: 20px auto; padding: 10px; border-bottom: 2px solid #00FFA3; display: inline-block; }
            .footer { font-size: 14px; color: #777; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <h2 style="color: #222;">Reset Your StakeSol Password</h2>
            <p style="color: #555;">Your password reset OTP is valid for 10 minutes.</p>
            <div class="otp">${resetOTP}</div>
            <p style="color: #777;">If you didn't request this, please ignore this email.</p>
          </div>
        </body>
        </html>
      `,
    });

    return res
      .status(200)
      .json({ message: "Password reset OTP sent to your email" });
  } catch (error) {
    console.error("❌ Forgot Password Error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Verify OTP and reset password
exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const user = await User.findOne({
      email,
      resetPasswordOTP: otp,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update user password and clear reset fields
    user.password = hashedPassword;
    user.resetPasswordOTP = null;
    user.resetPasswordExpires = null;
    await user.save();

    return res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    console.error("❌ Reset Password Error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { name, email } = req.body;

    // Find the user
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // If email is being changed
    if (email && email !== user.email) {
      // Check if the new email already exists
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return res.status(400).json({ message: "Email already in use" });
      }

      // Generate OTP for email verification
      const otp = generateOTP();
      user.otp = otp;
      user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);

      // Save current state but don't update email yet
      if (name) user.name = name;
      await user.save();

      // Send OTP to new email
      try {
        await sendOTP(email, otp);
      } catch (emailError) {
        console.error("❌ Error sending OTP email:", emailError);
        return res
          .status(500)
          .json({ message: "Error sending OTP email. Please try again." });
      }

      return res.status(200).json({
        message: "OTP sent to new email. Verify to complete update.",
        pendingEmail: email,
        name: user.name,
      });
    }

    // If only name is being updated
    if (name) {
      user.name = name;
      await user.save();
    }

    return res.status(200).json({
      message: "Profile updated successfully",
      user: {
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("❌ Update Profile Error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Verify new email with OTP
exports.verifyNewEmail = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { otp, newEmail } = req.body;

    if (!otp || !newEmail) {
      return res
        .status(400)
        .json({ message: "OTP and new email are required" });
    }

    const user = await User.findById(userId).select("+otp +otpExpires");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if OTP is valid
    if (!user.otp || user.otp.toString().trim() !== otp.toString().trim()) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // Check if OTP is expired
    if (new Date(user.otpExpires) < new Date()) {
      return res.status(400).json({ message: "OTP has expired" });
    }

    // Update email
    user.email = newEmail;
    user.otp = null;
    user.otpExpires = null;
    await user.save();

    return res.status(200).json({
      message: "Email updated successfully",
      user: {
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("❌ Verify New Email Error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
