const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");
require("dotenv").config();

// Email transporter configuration
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || "gmail",
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT || 587,
  secure: process.env.EMAIL_SECURE === "true",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Email template generator
const generateEmailTemplate = (type, data) => {
  const templates = {
    pending: {
      subject: `Withdrawal Request Pending (${data.amount} SOL)`,
      text: `Your withdrawal of ${data.amount} SOL ($${data.solValue}) to address ${data.walletAddress} is pending admin approval.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4f46e5;">Withdrawal Request Received</h2>
          <p>Your withdrawal of <strong>${data.amount} SOL</strong> ($${
        data.solValue
      }) is pending approval.</p>
          <div style="background-color: #f3f4f6; padding: 12px; border-radius: 8px; margin: 16px 0;">
            <p><strong>Recipient:</strong> ${data.walletAddress}</p>
            <p><strong>Transaction ID:</strong> ${data.id}</p>
            <p><strong>Date:</strong> ${new Date(
              data.timestamp
            ).toLocaleString()}</p>
          </div>
          <p>This usually takes 1-24 hours to process. You'll receive another email once your request has been approved.</p>
          <p style="margin-top: 24px; color: #6b7280; font-size: 14px;">
            If you didn't initiate this request, please contact support immediately.
          </p>
        </div>
      `,
    },
    approved: {
      subject: `Withdrawal Approved (${data.amount} SOL)`,
      text: `Your withdrawal of ${data.amount} SOL ($${data.solValue}) to ${data.walletAddress} has been approved. Funds have been sent.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #10b981;">Withdrawal Approved!</h2>
          <p>Your withdrawal of <strong>${data.amount} SOL</strong> ($${
        data.solValue
      }) has been processed successfully.</p>
          <div style="background-color: #ecfdf5; padding: 12px; border-radius: 8px; margin: 16px 0;">
            <p><strong>Sent to:</strong> ${data.walletAddress}</p>
            <p><strong>Transaction ID:</strong> ${data.id}</p>
            <p><strong>Completed at:</strong> ${new Date().toLocaleString()}</p>
          </div>
          <p>The funds should appear in your wallet shortly.</p>
          <p style="margin-top: 24px; color: #6b7280; font-size: 14px;">
            Thank you for using our service.
          </p>
        </div>
      `,
    },
    rejected: {
      subject: `Withdrawal Request Processed`,
      text: `Your withdrawal of ${data.amount} SOL to ${data.walletAddress} was not approved. Contact support for details.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #ef4444;">Withdrawal Not Approved</h2>
          <p>Your withdrawal request for <strong>${
            data.amount
          } SOL</strong> to address ${data.walletAddress} was not approved.</p>
          <div style="background-color: #fef2f2; padding: 12px; border-radius: 8px; margin: 16px 0;">
            <p><strong>Transaction ID:</strong> ${data.id}</p>
            <p><strong>Date:</strong> ${new Date(
              data.timestamp
            ).toLocaleString()}</p>
          </div>
          <p>Please contact our support team if you believe this was in error.</p>
          <p style="margin-top: 24px; color: #6b7280; font-size: 14px;">
            For security reasons, we cannot provide specific details via email.
          </p>
        </div>
      `,
    },
  };

  return templates[type] || templates.pending;
};

// Email sending endpoint
router.post("/send-withdrawal-email", async (req, res) => {
  try {
    const { email, type, ...data } = req.body;

    if (!email || !type) {
      return res.status(400).json({ error: "Email and type are required" });
    }

    const template = generateEmailTemplate(type, data);

    const mailOptions = {
      from: `"Crypto Withdrawals" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: template.subject,
      text: template.text,
      html: template.html,
    };

    await transporter.sendMail(mailOptions);
    res.json({ success: true, message: "Email sent successfully" });
  } catch (error) {
    console.error("Email send error:", error);
    res
      .status(500)
      .json({ error: "Failed to send email", details: error.message });
  }
});

module.exports = router;
