module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    console.log('🧪 Simple test endpoint called');
    
    // Test nodemailer import
    const nodemailer = require('nodemailer');
    console.log('✅ Nodemailer imported successfully');
    
    // Test environment variables
    const envCheck = {
      hasSmtpUser: !!process.env.SMTP_USER,
      hasSmtpPass: !!process.env.SMTP_PASS,
      smtpUser: process.env.SMTP_USER ? 'set' : 'not set',
      smtpHost: process.env.SMTP_HOST || 'default: smtp.gmail.com'
    };
    console.log('📋 Environment check:', envCheck);
    
    // Test creating a transporter (without sending)
    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });
      console.log('✅ Transporter created successfully');
      
      // Try to verify the connection
      try {
        await transporter.verify();
        console.log('✅ SMTP connection verified');
      } catch (verifyError) {
        console.log('❌ SMTP verification failed:', verifyError.message);
      }
    }
    
    res.status(200).json({
      success: true,
      message: 'Simple test completed',
      environment: envCheck,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Simple test failed:', error);
    
    res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack
    });
  }
}
