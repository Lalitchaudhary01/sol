const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const sendDepositNotification = async (email, amount, usdValue, txHash) => {
  const mailOptions = {
    from: `"Crypto Wallet" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Deposit Confirmation",
    html: require("../templates/depositNotification")(amount, usdValue, txHash),
  };

  return transporter.sendMail(mailOptions);
};

module.exports = {
  sendDepositNotification,
};
