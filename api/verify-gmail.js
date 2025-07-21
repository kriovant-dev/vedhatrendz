// Gmail verification endpoint
import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    console.log('Testing Gmail connection...');
    
    // Test different configurations
    const configs = [
      {
        name: 'Gmail Service',
        config: {
          service: 'gmail',
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
          }
        }
      },
      {
        name: 'Gmail SMTP',
        config: {
          host: 'smtp.gmail.com',
          port: 587,
          secure: false,
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
          }
        }
      },
      {
        name: 'Gmail SMTP SSL',
        config: {
          host: 'smtp.gmail.com',
          port: 465,
          secure: true,
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
          }
        }
      }
    ];

    const results = [];

    for (const { name, config } of configs) {
      try {
        console.log(`Testing ${name}...`);
        const transporter = nodemailer.createTransport(config);
        await transporter.verify();
        results.push({ name, status: 'success', message: 'Connection verified' });
        console.log(`✅ ${name} - Success`);
      } catch (error) {
        results.push({ name, status: 'error', message: error.message });
        console.log(`❌ ${name} - Error: ${error.message}`);
      }
    }

    return res.status(200).json({
      message: 'Gmail connection tests completed',
      results,
      environment: {
        hasUser: !!process.env.SMTP_USER,
        hasPass: !!process.env.SMTP_PASS,
        user: process.env.SMTP_USER ? process.env.SMTP_USER.substring(0, 5) + '***' : 'Not set'
      }
    });

  } catch (error) {
    return res.status(500).json({
      error: 'Verification failed',
      details: error.message
    });
  }
}
