// Simple test endpoint to check if Vercel functions are working
export default function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  return res.status(200).json({
    status: 'working',
    message: 'Vercel function is operational',
    timestamp: new Date().toISOString(),
    environment: {
      node_version: process.version,
      env_vars_count: Object.keys(process.env).length,
      has_smtp_host: !!process.env.SMTP_HOST,
      has_smtp_user: !!process.env.SMTP_USER,
      has_smtp_pass: !!process.env.SMTP_PASS,
      has_admin_email: !!process.env.ADMIN_EMAIL
    }
  });
};
