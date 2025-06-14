const nodemailer = require('nodemailer');

// Configure your SMTP settings here
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.ethereal.email',
  port: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 587,
  auth: {
    user: process.env.SMTP_USER || 'your_ethereal_user',
    pass: process.env.SMTP_PASS || 'your_ethereal_pass',
  },
});

async function sendMail({ to, subject, text, html }) {
  const mailOptions = {
    from: process.env.SMTP_FROM || 'no-reply@campus-event-checker.com',
    to,
    subject,
    text,
    html,
  };
  return transporter.sendMail(mailOptions);
}

module.exports = { sendMail };
