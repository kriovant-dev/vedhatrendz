// Test email endpoint for Vercel
import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email } = req.body;
    const testEmail = email || process.env.ADMIN_EMAIL || 'test@example.com';

    // Import nodemailer

    // Create transporter
    const transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Send test email
    const info = await transporter.sendMail({
      from: `"VedhaTrendz Test" <${process.env.SMTP_USER}>`,
      to: testEmail,
      subject: '🧪 VedhaTrendz Email Service Test - Vercel Deployment',
      html: `
        <h2>🎉 Email Service Test Successful!</h2>
        <p>This is a test email from your VedhaTrendz Vercel deployment.</p>
        <p><strong>Sent at:</strong> ${new Date().toISOString()}</p>
        <p><strong>Environment:</strong> Vercel Production</p>
        <hr>
        <p><small>VedhaTrendz Email Service</small></p>
      `,
      text: `VedhaTrendz Email Service Test - Your email service is working correctly on Vercel!`
    });

    console.log('📧 Test email sent successfully:', info.messageId);

    return res.status(200).json({
      success: true,
      messageId: info.messageId,
      message: `Test email sent successfully to ${testEmail}`
    });

  } catch (error) {
    console.error('❌ Test email failed:', error);
    
    return res.status(500).json({
      error: 'Failed to send test email',
      details: error.message
    });
  }
}
