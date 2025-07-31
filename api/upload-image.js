const ImageKit = require('imagekit');

// Initialize ImageKit with server-side credentials
const imagekit = new ImageKit({
  publicKey: process.env.VITE_IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.VITE_IMAGEKIT_PRIVATE_KEY,
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

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Check if ImageKit is configured
    if (!process.env.VITE_IMAGEKIT_PUBLIC_KEY || !process.env.VITE_IMAGEKIT_PRIVATE_KEY || !process.env.VITE_IMAGEKIT_URL_ENDPOINT) {
      return res.status(500).json({ 
        error: 'ImageKit configuration missing',
        details: 'Please check your environment variables'
      });
    }

    const { file, fileName, folder = 'products' } = req.body;

    if (!file || !fileName) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        details: 'file and fileName are required'
      });
    }

    // Upload to ImageKit
    const uploadResponse = await imagekit.upload({
      file: file, // Base64 string or Buffer
      fileName: fileName,
      folder: folder,
      useUniqueFileName: true,
      tags: ['vedhatrendz', 'product'],
      isPrivateFile: false
    });

    // Return the upload result
    res.status(200).json({
      success: true,
      data: {
        url: uploadResponse.url,
        thumbnailUrl: uploadResponse.thumbnailUrl || uploadResponse.url,
        fileId: uploadResponse.fileId,
        name: uploadResponse.name,
        size: uploadResponse.size,
        filePath: uploadResponse.filePath
      }
    });

  } catch (error) {
    console.error('ImageKit upload error:', error);
    
    res.status(500).json({ 
      error: 'Upload failed',
      details: error.message,
      code: error.code || 'UNKNOWN_ERROR'
    });
  }
}
