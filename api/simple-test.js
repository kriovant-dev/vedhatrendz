// Simple direct email test
import nodemailer from 'nodemailer';

export default async function handler(req, res) {
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
    // Simple nodemailer setup
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    const info = await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: 'chanakyadevendrachukka@gmail.com',
      subject: 'Simple Test Email from Vercel',
      text: 'This is a simple test email to check if the service is working.',
      html: '<h1>Test Email</h1><p>This is a simple test email to check if the service is working.</p>'
    });

    return res.status(200).json({
      success: true,
      messageId: info.messageId,
      message: 'Simple email sent successfully'
    });

  } catch (error) {
    return res.status(500).json({
      error: error.message,
      details: 'Simple email test failed'
    });
  }
}
