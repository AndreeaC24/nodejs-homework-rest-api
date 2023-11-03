const nodemailer = require("nodemailer");
require("dotenv").config();
//const User = require("../../models/schemas/user");

const emailAddress = process.env.OUTLOOK_EMAIL;
const emailPass = process.env.OUTLOOK_PASSWORD;

async function sendEmail(email, verificationToken) {
  const verificationLink = `http://localhost:5000/api/users/verify/${verificationToken}`;
  const config = {
    host: "smtp.office365.com",
    port: 587,
    secure: false,
    auth: {
      user: emailAddress,
      pass: emailPass,
    },
  };
  const transporter = nodemailer.createTransport(config);
  const mailOptions = {
    from: emailAddress,
    to: email,
    subject: "Confirm your account",
    html: `
    <p>Click the following link to verify your email:</p>
    <a href="${verificationLink}">Verify Email</a>
  `,
  };

  transporter
    .sendMail(mailOptions)
    .then((info) => console.log(info))
    .catch((err) => console.log(err));
}

module.exports = sendEmail;
