const nodemailer = require('nodemailer');

// Create reusable transporter object using SMTP transport
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false
    }
  });
};

// Email templates
const emailTemplates = {
  emailVerification: (data) => ({
    subject: 'Sacred Services - Verify Your Email Address',
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Email Verification - Sacred Services</title>
        <style>
          body {
            font-family: 'Arial', sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f4f4f4;
          }
          .container {
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 0 20px rgba(0,0,0,0.1);
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .logo {
            font-size: 28px;
            font-weight: bold;
            color: #FF6B35;
            margin-bottom: 10px;
          }
          .title {
            color: #8B4513;
            font-size: 24px;
            margin-bottom: 20px;
          }
          .content {
            margin-bottom: 30px;
          }
          .btn {
            display: inline-block;
            background: linear-gradient(135deg, #FFD700, #FF6B35);
            color: white;
            padding: 15px 30px;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
            margin: 20px 0;
            text-align: center;
          }
          .btn:hover {
            background: linear-gradient(135deg, #FFE55C, #FF6B35);
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            color: #666;
            font-size: 14px;
          }
          .warning {
            background-color: #fff3cd;
            border: 1px solid #ffeaa7;
            color: #856404;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">🕉️ Sacred Services</div>
            <h1 class="title">Verify Your Email Address</h1>
          </div>
          
          <div class="content">
            <p>Dear ${data.name},</p>
            
            <p>Welcome to Sacred Services! We're excited to have you join our community of devotees.</p>
            
            <p>To complete your registration and start booking sacred puja services, please verify your email address by clicking the button below:</p>
            
            <div style="text-align: center;">
              <a href="${data.verificationUrl}" class="btn">Verify Email Address</a>
            </div>
            
            <p>If the button doesn't work, you can also copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #666;">${data.verificationUrl}</p>
            
            <div class="warning">
              <strong>Important:</strong> This verification link will expire in 24 hours for security reasons.
            </div>
            
            <p>If you didn't create an account with Sacred Services, please ignore this email.</p>
            
            <p>Thank you for choosing Sacred Services for your spiritual needs.</p>
            
            <p>Blessings,<br>The Sacred Services Team</p>
          </div>
          
          <div class="footer">
            <p>Sacred Services - Connecting You to Divine Blessings</p>
            <p>This is an automated email. Please do not reply to this message.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      Dear ${data.name},

      Welcome to Sacred Services! 

      Please verify your email address by visiting this link:
      ${data.verificationUrl}

      This link will expire in 24 hours.

      If you didn't create an account with Sacred Services, please ignore this email.

      Blessings,
      The Sacred Services Team
    `
  }),

  passwordReset: (data) => ({
    subject: 'Sacred Services - Password Reset Request',
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset - Sacred Services</title>
        <style>
          body {
            font-family: 'Arial', sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f4f4f4;
          }
          .container {
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 0 20px rgba(0,0,0,0.1);
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .logo {
            font-size: 28px;
            font-weight: bold;
            color: #FF6B35;
            margin-bottom: 10px;
          }
          .title {
            color: #8B4513;
            font-size: 24px;
            margin-bottom: 20px;
          }
          .content {
            margin-bottom: 30px;
          }
          .btn {
            display: inline-block;
            background: linear-gradient(135deg, #FFD700, #FF6B35);
            color: white;
            padding: 15px 30px;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
            margin: 20px 0;
            text-align: center;
          }
          .btn:hover {
            background: linear-gradient(135deg, #FFE55C, #FF6B35);
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            color: #666;
            font-size: 14px;
          }
          .warning {
            background-color: #f8d7da;
            border: 1px solid #f5c6cb;
            color: #721c24;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
          }
          .security-info {
            background-color: #d1ecf1;
            border: 1px solid #bee5eb;
            color: #0c5460;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">🕉️ Sacred Services</div>
            <h1 class="title">Password Reset Request</h1>
          </div>
          
          <div class="content">
            <p>Dear ${data.name},</p>
            
            <p>We received a request to reset the password for your Sacred Services account.</p>
            
            <p>If you requested this password reset, please click the button below to create a new password:</p>
            
            <div style="text-align: center;">
              <a href="${data.resetUrl}" class="btn">Reset Password</a>
            </div>
            
            <p>If the button doesn't work, you can also copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #666;">${data.resetUrl}</p>
            
            <div class="warning">
              <strong>Important:</strong> This password reset link will expire in 10 minutes for security reasons.
            </div>
            
            <div class="security-info">
              <strong>Security Notice:</strong>
              <ul>
                <li>If you didn't request this password reset, please ignore this email</li>
                <li>Your password will remain unchanged if you don't click the reset link</li>
                <li>For security, consider changing your password regularly</li>
                <li>Never share your password with anyone</li>
              </ul>
            </div>
            
            <p>If you continue to have problems or didn't request this reset, please contact our support team.</p>
            
            <p>Stay blessed,<br>The Sacred Services Team</p>
          </div>
          
          <div class="footer">
            <p>Sacred Services - Connecting You to Divine Blessings</p>
            <p>This is an automated email. Please do not reply to this message.</p>
            <p>If you need help, contact us at support@sacredservices.com</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      Dear ${data.name},

      We received a request to reset the password for your Sacred Services account.

      If you requested this password reset, please visit this link to create a new password:
      ${data.resetUrl}

      This link will expire in 10 minutes for security reasons.

      If you didn't request this password reset, please ignore this email.

      Stay blessed,
      The Sacred Services Team
    `
  }),

  welcomeEmail: (data) => ({
    subject: 'Welcome to Sacred Services - Your Spiritual Journey Begins',
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome - Sacred Services</title>
        <style>
          body {
            font-family: 'Arial', sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f4f4f4;
          }
          .container {
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 0 20px rgba(0,0,0,0.1);
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .logo {
            font-size: 28px;
            font-weight: bold;
            color: #FF6B35;
            margin-bottom: 10px;
          }
          .title {
            color: #8B4513;
            font-size: 24px;
            margin-bottom: 20px;
          }
          .content {
            margin-bottom: 30px;
          }
          .btn {
            display: inline-block;
            background: linear-gradient(135deg, #FFD700, #FF6B35);
            color: white;
            padding: 15px 30px;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
            margin: 20px 0;
            text-align: center;
          }
          .services {
            background-color: #fff8e1;
            border: 1px solid #ffecb3;
            padding: 20px;
            border-radius: 5px;
            margin: 20px 0;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            color: #666;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">🕉️ Sacred Services</div>
            <h1 class="title">Welcome to Our Sacred Community!</h1>
          </div>
          
          <div class="content">
            <p>Dear ${data.name},</p>
            
            <p>🙏 Welcome to Sacred Services! We are delighted to have you join our community of devotees.</p>
            
            <p>Your account has been successfully created and verified. You can now access all our sacred services and book pujas for your spiritual needs.</p>
            
            <div class="services">
              <h3>🌟 Available Services:</h3>
              <ul>
                <li>🏠 <strong>Griha Pravesh Puja</strong> - Bless your new home</li>
                <li>🎓 <strong>Vidyarambh Sanskar</strong> - Begin your learning journey</li>
                <li>💍 <strong>Vivah Sanskar</strong> - Sacred wedding ceremonies</li>
                <li>🌸 <strong>Annaprashan</strong> - First feeding ceremony</li>
                <li>📿 <strong>Mundan Sanskar</strong> - First haircut ceremony</li>
                <li>🕯️ <strong>Havan & Yagna</strong> - Fire ceremonies</li>
              </ul>
            </div>
            
            <div style="text-align: center;">
              <a href="${data.dashboardUrl || '#'}" class="btn">Explore Services</a>
            </div>
            
            <p>Our experienced pandits are ready to guide you through authentic Vedic rituals with proper mantras and procedures.</p>
            
            <p>If you have any questions or need assistance, our support team is always here to help.</p>
            
            <p>May your spiritual journey be filled with divine blessings and peace.</p>
            
            <p>Om Shanti Shanti Shanti 🕉️<br>The Sacred Services Team</p>
          </div>
          
          <div class="footer">
            <p>Sacred Services - Connecting You to Divine Blessings</p>
            <p>Contact us: support@sacredservices.com | +91-XXXX-XXXXXX</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      Dear ${data.name},

      Welcome to Sacred Services! 

      Your account has been successfully created and verified. You can now access all our sacred services and book pujas for your spiritual needs.

      Available Services:
      - Griha Pravesh Puja - Bless your new home
      - Vidyarambh Sanskar - Begin your learning journey  
      - Vivah Sanskar - Sacred wedding ceremonies
      - Annaprashan - First feeding ceremony
      - Mundan Sanskar - First haircut ceremony
      - Havan & Yagna - Fire ceremonies

      Our experienced pandits are ready to guide you through authentic Vedic rituals.

      Om Shanti Shanti Shanti
      The Sacred Services Team
    `
  })
};

// Main send email function
const sendEmail = async (options) => {
  try {
    const transporter = createTransporter();

    // Verify transporter configuration
    await transporter.verify();

    let emailContent;

    // Use template if specified
    if (options.template && emailTemplates[options.template]) {
      emailContent = emailTemplates[options.template](options.data || {});
    } else {
      emailContent = {
        subject: options.subject,
        html: options.html,
        text: options.text
      };
    }

    const mailOptions = {
      from: {
        name: 'Sacred Services',
        address: process.env.EMAIL_USER
      },
      to: options.email,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text,
      // Add some headers for better deliverability
      headers: {
        'X-Priority': '1',
        'X-MSMail-Priority': 'High',
        'Importance': 'high'
      }
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);

    console.log('Email sent successfully:', {
      messageId: info.messageId,
      to: options.email,
      subject: emailContent.subject
    });

    return {
      success: true,
      messageId: info.messageId,
      response: info.response
    };

  } catch (error) {
    console.error('Email sending failed:', {
      error: error.message,
      to: options.email,
      template: options.template
    });

    throw new Error(`Failed to send email: ${error.message}`);
  }
};

// Send bulk emails (for newsletters, announcements, etc.)
const sendBulkEmail = async (recipients, options) => {
  const results = [];
  const batchSize = 10; // Send in batches to avoid rate limiting

  for (let i = 0; i < recipients.length; i += batchSize) {
    const batch = recipients.slice(i, i + batchSize);
    
    const batchPromises = batch.map(async (recipient) => {
      try {
        const result = await sendEmail({
          ...options,
          email: recipient.email,
          data: { ...options.data, name: recipient.name }
        });
        
        return {
          email: recipient.email,
          success: true,
          messageId: result.messageId
        };
      } catch (error) {
        return {
          email: recipient.email,
          success: false,
          error: error.message
        };
      }
    });

    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults);

    // Add delay between batches to respect rate limits
    if (i + batchSize < recipients.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  return results;
};

// Test email configuration
const testEmailConfig = async () => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    console.log('✅ Email configuration is valid');
    return true;
  } catch (error) {
    console.error('❌ Email configuration error:', error.message);
    return false;
  }
};

module.exports = {
  sendEmail,
  sendBulkEmail,
  testEmailConfig,
  emailTemplates
};