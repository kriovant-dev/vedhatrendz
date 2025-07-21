// Simple nodemailer test
const nodemailer = require('nodemailer');
require('dotenv').config({ path: '.env.local' });

console.log('Testing nodemailer...');
console.log('nodemailer object:', typeof nodemailer);
console.log('createTransporter function:', typeof nodemailer.createTransporter);

if (nodemailer.createTransporter) {
  console.log('✅ createTransporter is available');
  
  const transporter = nodemailer.createTransporter({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS.replace(/"/g, '')
    }
  });
  
  console.log('✅ Transporter created successfully');
  
  // Test verification
  transporter.verify((error, success) => {
    if (error) {
      console.log('❌ SMTP verification failed:', error.message);
    } else {
      console.log('✅ SMTP server is ready');
    }
  });
  
} else {
  console.log('❌ createTransporter is not available');
  console.log('Available methods:', Object.keys(nodemailer));
}
