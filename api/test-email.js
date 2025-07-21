// Test email endpoint for Vercel with detailed logging
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
    console.log('🧪 Starting email test...');
    
    const { email } = req.body || {};
    const testEmail = email || process.env.ADMIN_EMAIL || 'chanakyadevendrachukka@gmail.com';
    
    console.log('📧 Test email recipient:', testEmail);
    console.log('🔧 SMTP Config:', {
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      user: process.env.SMTP_USER?.substring(0, 5) + '***',
      pass: process.env.SMTP_PASS ? 'SET' : 'MISSING'
    });

    // Create transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    console.log('🔍 Verifying SMTP connection...');
    await transporter.verify();
    console.log('✅ SMTP connection verified');

    console.log('📨 Sending test email...');
    
    const info = await transporter.sendMail({
      from: `"VedhaTrendz Test" <${process.env.SMTP_USER}>`,
      to: testEmail,
      subject: '🧪 VedhaTrendz Email Test - ' + new Date().toLocaleString(),
      html: `
        <h2>🎉 Email Service Test Successful!</h2>
        <p>This is a test email from your VedhaTrendz Vercel deployment.</p>
        <p><strong>Sent at:</strong> ${new Date().toISOString()}</p>
        <p><strong>Environment:</strong> Vercel Production</p>
        <p><strong>Recipient:</strong> ${testEmail}</p>
        <hr>
        <p><small>VedhaTrendz Email Service - Test Successful!</small></p>
      `,
      text: `VedhaTrendz Email Service Test - Your email service is working correctly on Vercel! Sent to: ${testEmail}`
    });

    console.log('📧 Email sent successfully:', info.messageId);

    return res.status(200).json({
      success: true,
      messageId: info.messageId,
      message: `Test email sent successfully to ${testEmail}`,
      timestamp: new Date().toISOString(),
      response: info.response
    });

  } catch (error) {
    console.error('❌ Test email failed:', error);
    
    return res.status(500).json({
      error: 'Failed to send test email',
      details: error.message,
      code: error.code,
      timestamp: new Date().toISOString()
    });
  }
}
