import nodemailer from 'nodemailer';
import config from '../config/index.js';
import logger from '../utils/logger.js';

/**
 * Email Service
 * Handles all email-related operations using Nodemailer
 */
class EmailService {
  constructor() {
    this.transporter = null;
    this.isConfigured = false;
  }

  /**
   * Initialize email transporter
   */
  initialize() {
    try {
      const emailConfig = config.email;

      if (!emailConfig?.host || !emailConfig?.user) {
        logger.warn('Email service not configured. Emails will be logged only.');
        return;
      }

      this.transporter = nodemailer.createTransport({
        host: emailConfig.host,
        port: emailConfig.port || 587,
        secure: emailConfig.secure || false,
        auth: {
          user: emailConfig.user,
          pass: emailConfig.pass,
        },
      });

      this.isConfigured = true;
      logger.info('Email service initialized');
    } catch (error) {
      logger.error('Failed to initialize email service:', { error: error.message });
    }
  }

  /**
   * Send email
   * @param {Object} options - Email options
   * @returns {Promise<Object>}
   */
  async send(options) {
    const { to, subject, text, html, attachments } = options;

    const mailOptions = {
      from: `"${config.email?.fromName || 'App'}" <${config.email?.from || 'noreply@app.com'}>`,
      to,
      subject,
      text,
      html,
      attachments,
    };

    // If not configured, just log the email
    if (!this.isConfigured || !this.transporter) {
      logger.info('Email (not sent - transporter not configured):', {
        to,
        subject,
        preview: text?.substring(0, 100),
      });
      return { messageId: 'mock-' + Date.now(), accepted: [to] };
    }

    try {
      const info = await this.transporter.sendMail(mailOptions);
      logger.info('Email sent:', { messageId: info.messageId, to });
      return info;
    } catch (error) {
      logger.error('Failed to send email:', { error: error.message, to });
      throw error;
    }
  }

  /**
   * Send welcome email
   * @param {Object} user - User object
   * @returns {Promise<Object>}
   */
  async sendWelcomeEmail(user) {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          .container { max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; color: white; }
          .content { padding: 30px; background: #f9f9f9; }
          .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
          .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to Our Platform! 🎉</h1>
          </div>
          <div class="content">
            <h2>Hello ${user.name}!</h2>
            <p>Thank you for joining us. We're excited to have you on board.</p>
            <p>Your account has been created successfully with the email: <strong>${user.email}</strong></p>
            <p>You can now access all features of our platform.</p>
            <a href="${config.clientUrl || 'http://localhost:3000'}" class="button">Get Started</a>
          </div>
          <div class="footer">
            <p>If you didn't create this account, please ignore this email.</p>
            <p>&copy; ${new Date().getFullYear()} Your Company. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.send({
      to: user.email,
      subject: 'Welcome to Our Platform!',
      text: `Hello ${user.name}! Welcome to our platform. Your account has been created successfully.`,
      html,
    });
  }

  /**
   * Send password reset email
   * @param {Object} user - User object
   * @param {string} resetToken - Password reset token
   * @returns {Promise<Object>}
   */
  async sendPasswordResetEmail(user, resetToken) {
    const resetUrl = `${config.clientUrl || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          .container { max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; }
          .header { background: #dc3545; padding: 30px; text-align: center; color: white; }
          .content { padding: 30px; background: #f9f9f9; }
          .button { display: inline-block; padding: 12px 30px; background: #dc3545; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
          .warning { background: #fff3cd; border: 1px solid #ffc107; padding: 15px; border-radius: 5px; margin-top: 20px; }
          .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Password Reset Request 🔐</h1>
          </div>
          <div class="content">
            <h2>Hello ${user.name},</h2>
            <p>We received a request to reset your password. Click the button below to create a new password:</p>
            <a href="${resetUrl}" class="button">Reset Password</a>
            <div class="warning">
              <strong>⚠️ Important:</strong> This link will expire in 1 hour. If you didn't request this, please ignore this email.
            </div>
          </div>
          <div class="footer">
            <p>If the button doesn't work, copy and paste this link: ${resetUrl}</p>
            <p>&copy; ${new Date().getFullYear()} Your Company. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.send({
      to: user.email,
      subject: 'Password Reset Request',
      text: `Hello ${user.name}, reset your password using this link: ${resetUrl}. This link expires in 1 hour.`,
      html,
    });
  }

  /**
   * Send email verification
   * @param {Object} user - User object
   * @param {string} verificationToken - Email verification token
   * @returns {Promise<Object>}
   */
  async sendEmailVerification(user, verificationToken) {
    const verifyUrl = `${config.clientUrl || 'http://localhost:3000'}/verify-email?token=${verificationToken}`;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          .container { max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; }
          .header { background: #28a745; padding: 30px; text-align: center; color: white; }
          .content { padding: 30px; background: #f9f9f9; }
          .button { display: inline-block; padding: 12px 30px; background: #28a745; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
          .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Verify Your Email ✉️</h1>
          </div>
          <div class="content">
            <h2>Hello ${user.name},</h2>
            <p>Please verify your email address by clicking the button below:</p>
            <a href="${verifyUrl}" class="button">Verify Email</a>
            <p style="margin-top: 20px;">This link will expire in 24 hours.</p>
          </div>
          <div class="footer">
            <p>If you didn't create an account, please ignore this email.</p>
            <p>&copy; ${new Date().getFullYear()} Your Company. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.send({
      to: user.email,
      subject: 'Verify Your Email Address',
      text: `Hello ${user.name}, verify your email using this link: ${verifyUrl}`,
      html,
    });
  }

  /**
   * Verify SMTP connection
   * @returns {Promise<boolean>}
   */
  async verify() {
    if (!this.transporter) {
      return false;
    }

    try {
      await this.transporter.verify();
      logger.info('Email service connection verified');
      return true;
    } catch (error) {
      logger.error('Email service verification failed:', { error: error.message });
      return false;
    }
  }
}

// Export singleton instance
export const emailService = new EmailService();
export default emailService;

