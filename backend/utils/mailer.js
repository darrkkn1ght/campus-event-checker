const nodemailer = require('nodemailer');

// Configure SendGrid SMTP settings from .env
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.sendgrid.net',
  port: process.env.EMAIL_PORT ? parseInt(process.env.EMAIL_PORT) : 587,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendMail({ to, subject, text, html, attachments }) {
  const mailOptions = {
    from: process.env.EMAIL_FROM || 'no-reply@campus-event-checker.com',
    to,
    subject,
    text,
    html,
    attachments,
  };
  return transporter.sendMail(mailOptions);
}

module.exports = { sendMail };
