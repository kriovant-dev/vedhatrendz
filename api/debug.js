// Debug endpoint to check environment variables
export default function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Check environment variables
  const envCheck = {
    SMTP_HOST: process.env.SMTP_HOST ? '✅ Set' : '❌ Missing',
    SMTP_PORT: process.env.SMTP_PORT ? '✅ Set' : '❌ Missing',
    SMTP_USER: process.env.SMTP_USER ? '✅ Set' : '❌ Missing',
    SMTP_PASS: process.env.SMTP_PASS ? '✅ Set' : '❌ Missing',
    ADMIN_EMAIL: process.env.ADMIN_EMAIL ? '✅ Set' : '❌ Missing',
    VITE_ADMIN_EMAIL: process.env.VITE_ADMIN_EMAIL ? '✅ Set' : '❌ Missing',
  };

  const allSet = Object.values(envCheck).every(status => status === '✅ Set');

  return res.status(200).json({
    status: allSet ? 'ready' : 'missing_variables',
    message: allSet ? 'All environment variables are set!' : 'Some environment variables are missing',
    environment_variables: envCheck,
    timestamp: new Date().toISOString(),
    vercel_env: process.env.VERCEL_ENV || 'unknown'
  });
}
