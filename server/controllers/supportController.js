const SupportTicket = require("../models/SupportTicket");
const nodemailer = require("nodemailer");
const crypto = require("crypto");

// Email Transporter Configuration
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Function to generate a unique support ticket number
const generateTicketNumber = () => {
  return "ST-" + crypto.randomBytes(4).toString("hex").toUpperCase();
};

// Submit Support Ticket Handler
exports.submitSupportTicket = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ message: "All fields are required!" });
    }

    // Generate Support Ticket Number
    const ticketNumber = generateTicketNumber();

    // Save Ticket to MongoDB
    const newTicket = new SupportTicket({
      name,
      email,
      subject,
      message,
      ticketNumber,
    });

    await newTicket.save();

    // **Styled Light-Themed Email**
    const emailHTML = `
      <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          body { 
            font-family: Arial, sans-serif; 
            background-color: #f9f9f9; 
            color: #333; 
            text-align: center;
            padding: 30px;
          }
          .container {
            max-width: 500px;
            margin: auto;
            background: #ffffff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0px 0px 10px rgba(0,0,0,0.1);
          }
          h2 {
            color: #4A90E2;
            font-size: 22px;
            font-weight: bold;
            margin-bottom: 10px;
          }
          .message {
            font-size: 16px;
            line-height: 1.6;
            color: #555;
          }
          .ticket {
            font-size: 18px;
            font-weight: bold;
            color: #E74C3C;
            margin: 10px 0;
          }
          .footer {
            font-size: 14px;
            color: #888;
            margin-top: 20px;
          }
          a {
            color: #4A90E2;
            text-decoration: none;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>StakeSol Support</h2>
          <p class="message"><strong>Hello ${name},</strong></p>
          <p class="message">Your support request has been received.</p>
          <p class="ticket">Ticket Number: ${ticketNumber}</p>
          <p class="message">Our team will get back to you shortly.</p>
          <p class="message">For common questions, visit our <a href="https://stakesol.org/support">Support Center</a>.</p>
          <p class="footer">This is an automated message. Please do not reply.</p>
          <p class="footer"><strong style="color: #4A90E2;">StakeSol Team</strong></p>
        </div>
      </body>
      </html>
    `;

    // Send Email to Support Team
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: process.env.EMAIL_USER, // Receiving Email (Support Team)
        subject: `Support Request: ${subject} (Ticket: ${ticketNumber})`,
        text: `Support Ticket Number: ${ticketNumber}\n\nFrom: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
      });

      console.log(`Support email sent for ticket ${ticketNumber}`);
    } catch (error) {
      console.error("Error sending support team email:", error);
    }

    // Send Auto-Reply Email to User
    try {
      await transporter.sendMail({
        from: `"StakeSol Team" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: `Support Ticket Received - ${ticketNumber}`,
        html: emailHTML,
      });

      console.log(`Auto-reply sent to user ${email} for ticket ${ticketNumber}`);
    } catch (error) {
      console.error("Error sending auto-reply email:", error);
    }

    res.json({ message: "Support request submitted successfully.", ticketNumber });

  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
