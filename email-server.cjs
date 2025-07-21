const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
require('dotenv').config({ path: '.env.local' });

const app = express();
const PORT = process.env.EMAIL_SERVER_PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Email transporter configuration
const createTransporter = () => {
  // Try OAuth2 first, fallback to app password
  if (process.env.GMAIL_CLIENT_ID && process.env.GMAIL_CLIENT_SECRET && process.env.GMAIL_REFRESH_TOKEN) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: process.env.SMTP_USER,
        clientId: process.env.GMAIL_CLIENT_ID,
        clientSecret: process.env.GMAIL_CLIENT_SECRET,
        refreshToken: process.env.GMAIL_REFRESH_TOKEN
      }
    });
  } else {
    // Fallback to basic auth with app password
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS.replace(/"/g, '') // Remove quotes if present
      }
    });
  }
};

// Verify SMTP connection on startup
const verifyEmailConnection = async () => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    console.log('✅ SMTP connection verified successfully');
    return true;
  } catch (error) {
    console.error('❌ SMTP connection failed:', error.message);
    return false;
  }
};

// Email sending endpoint
app.post('/api/send-email', async (req, res) => {
  try {
    const { to, subject, html, text } = req.body;

    if (!to || !subject || !html) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: to, subject, html'
      });
    }

    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"VedhaTrendz" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
      text: text || ''
    };

    const result = await transporter.sendMail(mailOptions);
    
    console.log(`📧 Email sent successfully to ${to}:`, result.messageId);
    
    res.json({
      success: true,
      messageId: result.messageId,
      message: 'Email sent successfully'
    });
  } catch (error) {
    console.error('❌ Email sending failed:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'VedhaTrendz Email Service',
    timestamp: new Date().toISOString()
  });
});

// Test email endpoint
app.post('/api/test-email', async (req, res) => {
  try {
    const testEmail = req.body.email || process.env.ADMIN_EMAIL;
    
    if (!testEmail) {
      return res.status(400).json({
        success: false,
        error: 'No test email address provided'
      });
    }

    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"VedhaTrendz Test" <${process.env.SMTP_USER}>`,
      to: testEmail,
      subject: '✅ Email Service Test - VedhaTrendz',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #d4af37, #ffd700); color: white; padding: 20px; text-align: center; border-radius: 8px;">
            <h1>✅ Email Service Test Successful!</h1>
            <p>VedhaTrendz Email System</p>
          </div>
          <div style="background: #f9f9f9; padding: 20px; margin-top: 0;">
            <p>Congratulations! Your email service is working correctly.</p>
            <p><strong>Test Details:</strong></p>
            <ul>
              <li>Time: ${new Date().toLocaleString()}</li>
              <li>Service: VedhaTrendz Email Service</li>
              <li>Status: ✅ Operational</li>
            </ul>
            <p>You can now receive order notifications and send customer confirmations.</p>
          </div>
        </div>
      `,
      text: `
Email Service Test Successful!

Congratulations! Your VedhaTrendz email service is working correctly.

Test Details:
- Time: ${new Date().toLocaleString()}
- Service: VedhaTrendz Email Service  
- Status: ✅ Operational

You can now receive order notifications and send customer confirmations.
      `.trim()
    };

    const result = await transporter.sendMail(mailOptions);
    
    res.json({
      success: true,
      messageId: result.messageId,
      message: `Test email sent successfully to ${testEmail}`
    });
  } catch (error) {
    console.error('❌ Test email failed:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Start server
const startServer = async () => {
  // Verify email connection before starting
  const emailConnected = await verifyEmailConnection();
  
  if (!emailConnected) {
    console.log('⚠️  Starting server without email verification. Please check your SMTP settings.');
  }

  app.listen(PORT, () => {
    console.log(`\n🚀 VedhaTrendz Email Service started successfully!`);
    console.log(`📧 Server running on http://localhost:${PORT}`);
    console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
    console.log(`📨 Send email: POST http://localhost:${PORT}/api/send-email`);
    console.log(`🧪 Test email: POST http://localhost:${PORT}/api/test-email`);
    console.log(`\n📋 Available endpoints:`);
    console.log(`   GET  /api/health     - Service health check`);
    console.log(`   POST /api/send-email - Send email`);
    console.log(`   POST /api/test-email - Send test email`);
    console.log(`\n⚙️  Environment variables required:`);
    console.log(`   SMTP_USER, SMTP_PASS, ADMIN_EMAIL`);
    console.log(`\n${emailConnected ? '✅' : '❌'} SMTP Status: ${emailConnected ? 'Connected' : 'Not connected'}\n`);
  });
};

startServer().catch(error => {
  console.error('❌ Failed to start email service:', error);
  process.exit(1);
});

module.exports = app;
