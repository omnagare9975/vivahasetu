const nodemailer = require('nodemailer');

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

const sendEmail = async ({ to, subject, html }) => {
  const transporter = createTransporter();
  const mailOptions = {
    from: `"VivahSetu" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  };
  return transporter.sendMail(mailOptions);
};

const emailTemplates = {
  verifyEmail: (name, verificationUrl) => ({
    subject: 'Verify Your VivahSetu Account',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #e91e63 0%, #9c27b0 100%); padding: 40px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">VivahSetu</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0;">Find Your Perfect Life Partner</p>
        </div>
        <div style="padding: 40px; background: #fff;">
          <h2 style="color: #333;">Hello ${name},</h2>
          <p style="color: #666; line-height: 1.6;">Welcome to VivahSetu! Please verify your email address to get started.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" style="background: linear-gradient(135deg, #e91e63 0%, #9c27b0 100%); color: white; padding: 14px 32px; border-radius: 25px; text-decoration: none; font-size: 16px; font-weight: bold;">Verify Email</a>
          </div>
          <p style="color: #999; font-size: 14px;">This link expires in 24 hours. If you didn't create an account, please ignore this email.</p>
        </div>
        <div style="background: #f9f9f9; padding: 20px; text-align: center; color: #999; font-size: 12px;">
          <p>© 2026 VivahSetu. All rights reserved.</p>
        </div>
      </div>
    `,
  }),

  resetPassword: (name, resetUrl) => ({
    subject: 'Reset Your VivahSetu Password',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #e91e63 0%, #9c27b0 100%); padding: 40px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">VivahSetu</h1>
        </div>
        <div style="padding: 40px; background: #fff;">
          <h2 style="color: #333;">Hello ${name},</h2>
          <p style="color: #666; line-height: 1.6;">We received a request to reset your password. Click the button below to create a new password.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background: linear-gradient(135deg, #e91e63 0%, #9c27b0 100%); color: white; padding: 14px 32px; border-radius: 25px; text-decoration: none; font-size: 16px; font-weight: bold;">Reset Password</a>
          </div>
          <p style="color: #999; font-size: 14px;">This link expires in 10 minutes. If you didn't request a password reset, please ignore this email.</p>
        </div>
      </div>
    `,
  }),
};

module.exports = { sendEmail, emailTemplates };
