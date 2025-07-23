module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow GET method
  if (req.method !== 'GET') {
    return res.status(405).json({
      error: 'Method not allowed. Use GET.'
    });
  }

  // Check if nodemailer is available
  let nodemailerStatus = 'unknown';
  try {
    const nodemailer = require('nodemailer');
    nodemailerStatus = 'available';
  } catch (error) {
    nodemailerStatus = `error: ${error.message}`;
  }

  res.status(200).json({
    status: 'OK',
    service: 'VedhaTrendz Email Service',
    timestamp: new Date().toISOString(),
    environment: {
      nodeVersion: process.version,
      platform: process.platform,
      hasSmtpUser: !!process.env.SMTP_USER,
      hasSmtpPass: !!process.env.SMTP_PASS,
      hasGmailOAuth: !!(process.env.GMAIL_CLIENT_ID && process.env.GMAIL_CLIENT_SECRET && process.env.GMAIL_REFRESH_TOKEN),
      smtpHost: process.env.SMTP_HOST || 'smtp.gmail.com',
      smtpPort: process.env.SMTP_PORT || '587',
      smtpSecure: process.env.SMTP_SECURE || 'false',
      nodemailerStatus
    },
    recommendations: [
      !process.env.SMTP_USER && 'Set SMTP_USER environment variable',
      !process.env.SMTP_PASS && !process.env.GMAIL_REFRESH_TOKEN && 'Set either SMTP_PASS or Gmail OAuth credentials',
    ].filter(Boolean)
  });
}
