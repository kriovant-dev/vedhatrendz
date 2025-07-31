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

  if (req.method !== 'DELETE') {
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

    const { fileId, fileIds } = req.body;

    if (!fileId && !fileIds) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        details: 'fileId or fileIds array is required'
      });
    }

    if (fileIds && Array.isArray(fileIds)) {
      // Delete multiple files
      const results = await Promise.allSettled(
        fileIds.map(id => imagekit.deleteFile(id))
      );

      const successCount = results.filter(result => result.status === 'fulfilled').length;
      const failures = results
        .map((result, index) => ({ fileId: fileIds[index], result }))
        .filter(item => item.result.status === 'rejected')
        .map(item => ({ 
          fileId: item.fileId, 
          error: item.result.reason?.message || 'Unknown error' 
        }));

      res.status(200).json({
        success: true,
        data: {
          total: fileIds.length,
          successful: successCount,
          failed: failures.length,
          failures: failures
        }
      });
    } else {
      // Delete single file
      await imagekit.deleteFile(fileId);
      
      res.status(200).json({
        success: true,
        data: {
          fileId: fileId,
          message: 'File deleted successfully'
        }
      });
    }

  } catch (error) {
    console.error('ImageKit delete error:', error);
    
    res.status(500).json({ 
      error: 'Delete failed',
      details: error.message,
      code: error.code || 'UNKNOWN_ERROR'
    });
  }
}
