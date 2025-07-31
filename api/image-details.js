const ImageKit = require('imagekit');

// Initialize ImageKit with server-side credentials
const imagekit = new ImageKit({
  publicKey: process.env.VITE_IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.VITE_IMAGEKIT_URL_ENDPOINT
});

module.exports = async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Check if ImageKit is configured
    if (!process.env.VITE_IMAGEKIT_PUBLIC_KEY || !process.env.IMAGEKIT_PRIVATE_KEY || !process.env.VITE_IMAGEKIT_URL_ENDPOINT) {
      return res.status(500).json({ 
        error: 'ImageKit configuration missing',
        details: 'Please check your environment variables'
      });
    }

    const { fileId } = req.query;

    if (!fileId) {
      return res.status(400).json({ 
        error: 'Missing required parameter',
        details: 'fileId query parameter is required'
      });
    }

    // Get file details from ImageKit
    const fileDetails = await imagekit.getFileDetails(fileId);

    res.status(200).json({
      success: true,
      data: fileDetails
    });

  } catch (error) {
    console.error('ImageKit get details error:', error);
    
    res.status(500).json({ 
      error: 'Failed to get image details',
      details: error.message,
      code: error.code || 'UNKNOWN_ERROR'
    });
  }
}
