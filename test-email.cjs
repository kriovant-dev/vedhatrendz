// Simple email test using CommonJS
const nodemailer = require('nodemailer');
require('dotenv').config({ path: '.env.local' });

async function testEmail() {
  console.log('🧪 Testing email configuration...');
  console.log('SMTP_USER:', process.env.SMTP_USER);
  console.log('SMTP_HOST:', process.env.SMTP_HOST);
  console.log('SMTP_PORT:', process.env.SMTP_PORT);
  
  // Test with Gmail
  const transporter = nodemailer.createTransporter({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS.replace(/"/g, '') // Remove quotes if present
    }
  });

  try {
    // Verify connection
    console.log('🔍 Verifying SMTP connection...');
    await transporter.verify();
    console.log('✅ SMTP connection successful!');
    
    // Send test email
    console.log('📧 Sending test email...');
    const result = await transporter.sendMail({
      from: `"VedhaTrendz Test" <${process.env.SMTP_USER}>`,
      to: process.env.ADMIN_EMAIL,
      subject: '✅ VedhaTrendz Email Test Successful',
      text: 'This is a test email from your VedhaTrendz application. Email system is working correctly!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #d4af37, #ffd700); color: white; padding: 20px; text-align: center; border-radius: 8px;">
            <h2>✅ VedhaTrendz Email Test Successful!</h2>
          </div>
          <div style="background: #f9f9f9; padding: 20px; margin-top: 0;">
            <p>Your VedhaTrendz email system is working correctly!</p>
            <p><strong>Configuration Details:</strong></p>
            <ul>
              <li><strong>From:</strong> ${process.env.SMTP_USER}</li>
              <li><strong>To:</strong> ${process.env.ADMIN_EMAIL}</li>
              <li><strong>Time:</strong> ${new Date().toLocaleString()}</li>
              <li><strong>Status:</strong> ✅ Operational</li>
            </ul>
            <p>🎉 You can now receive order notifications and send customer confirmations!</p>
          </div>
        </div>
      `
    });
    
    console.log('✅ Test email sent successfully!');
    console.log('📧 Message ID:', result.messageId);
    console.log('📬 Check your inbox at:', process.env.ADMIN_EMAIL);
    
  } catch (error) {
    console.error('❌ Email test failed:');
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    
    if (error.code === 'EAUTH') {
      console.log('\n🔧 Authentication failed. Solutions:');
      console.log('1. Double-check your App Password');
      console.log('2. Make sure 2FA is enabled on Gmail');
      console.log('3. Try regenerating the App Password');
    } else if (error.code === 'ECONNECTION') {
      console.log('\n🔧 Connection failed. Check your internet connection.');
    }
  }
}

testEmail();
