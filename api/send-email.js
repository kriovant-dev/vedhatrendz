const nodemailer = require('nodemailer');

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow POST method
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed. Use POST.'
    });
  }

  try {
    // Check environment variables
    if (!process.env.SMTP_USER) {
      throw new Error('SMTP_USER environment variable is not set');
    }
    if (!process.env.SMTP_PASS && !process.env.GMAIL_REFRESH_TOKEN) {
      throw new Error('Neither SMTP_PASS nor Gmail OAuth credentials are set');
    }

    const { to, subject, html, text } = req.body;

    if (!to || !subject || !html) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: to, subject, html'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(to)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email address format'
      });
    }

    // Create transporter with basic auth (app password)
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
    
    const mailOptions = {
      from: `"VedhaTrendz" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
      text: text || ''
    };

    const result = await transporter.sendMail(mailOptions);
    
    res.status(200).json({
      success: true,
      messageId: result.messageId,
      message: 'Email sent successfully'
    });
  } catch (error) {
    console.error('❌ Email sending failed:', error);
    console.error('❌ Error stack:', error.stack);
    
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to send email',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};
