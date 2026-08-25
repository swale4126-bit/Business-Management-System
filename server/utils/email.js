// server/utils/email.js
// Email sending utility using Nodemailer with SMTP & Dev fallback support

const nodemailer = require('nodemailer');
const { env } = require('../config/env');

let transporterInstance = null;

const getTransporter = async () => {
  if (transporterInstance) return transporterInstance;

  // Use configured SMTP settings if present
  if (env.SMTP_HOST && env.SMTP_USER) {
    transporterInstance = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT || 587,
      secure: env.SMTP_PORT === 465,
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
      },
    });
    return transporterInstance;
  }

  // Fallback: Create ethereal test account for development/testing
  try {
    const testAccount = await nodemailer.createTestAccount();
    transporterInstance = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    console.log(`[Email] Configured dev Ethereal SMTP test account: ${testAccount.user}`);
    return transporterInstance;
  } catch (err) {
    console.warn('[Email] Could not create Ethereal test account, fallback to console log:', err.message);
    return null;
  }
};

/**
 * Send password reset email
 * @param {string} to - Recipient email
 * @param {string} resetUrl - Reset password URL with token
 */
const sendPasswordResetEmail = async (to, resetUrl) => {
  const fromAddress = env.EMAIL_FROM || 'noreply@bms.com';
  
  console.log(`\n==================================================`);
  console.log(`📧 [PASSWORD RESET EMAIL SENT]`);
  console.log(`To: ${to}`);
  console.log(`Reset Link: ${resetUrl}`);
  console.log(`==================================================\n`);

  try {
    const transporter = await getTransporter();
    if (!transporter) return;

    const info = await transporter.sendMail({
      from: `"Business Management System" <${fromAddress}>`,
      to,
      subject: 'Reset Your BMS Password',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 12px; background-color: #ffffff;">
          <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="color: #2563eb; margin: 0; font-size: 24px;">Business Management System</h1>
            <p style="color: #6b7280; font-size: 14px; margin-top: 4px;">Password Reset Request</p>
          </div>
          <p style="color: #374151; font-size: 16px; line-height: 1.5;">Hello,</p>
          <p style="color: #374151; font-size: 16px; line-height: 1.5;">We received a request to reset the password for your BMS account (${to}). Click the button below to choose a new password:</p>
          <div style="text-align: center; margin: 32px 0;">
            <a href="${resetUrl}" style="background-color: #2563eb; color: #ffffff; padding: 12px 28px; font-weight: bold; text-decoration: none; border-radius: 8px; display: inline-block; font-size: 16px;">
              Reset Password
            </a>
          </div>
          <p style="color: #4b5563; font-size: 14px; line-height: 1.5;">Or copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #2563eb; font-size: 13px;">${resetUrl}</p>
          <p style="color: #6b7280; font-size: 13px; margin-top: 24px; border-t: 1px solid #f3f4f6; padding-top: 16px;">
            This link will expire in <strong>1 hour</strong>. If you did not request a password reset, you can safely ignore this email.
          </p>
        </div>
      `,
    });

    if (info?.messageId && nodemailer.getTestMessageUrl(info)) {
      console.log(`[Email Preview URL]: ${nodemailer.getTestMessageUrl(info)}`);
    }
  } catch (err) {
    console.error('[Email] Failed to send email via SMTP transporter:', err.message);
  }
};

module.exports = { sendPasswordResetEmail };
