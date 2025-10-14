import { S3Client, PutObjectCommand, PutObjectCommandInput } from '@aws-sdk/client-s3';

// Configure R2 client
const r2Client = new S3Client({
  region: 'auto',
  endpoint: process.env.CLOUDFLARE_R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY || '',
  },
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // In a real serverless environment, you'd use a multipart form parser
    // For this example, we'll assume the file data comes as base64
    const { fileData, fileName, contentType, folder = 'products' } = req.body;

    if (!fileData || !fileName) {
      return res.status(400).json({ error: 'Missing file data or filename' });
    }

    // Convert base64 to buffer
    const buffer = Buffer.from(fileData, 'base64');
    
    // Create object key with folder structure
    const timestamp = Date.now();
    const sanitizedName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const objectKey = `${folder}/${timestamp}_${sanitizedName}`;

    const uploadParams = {
      Bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME,
      Key: objectKey,
      Body: buffer,
      ContentType: contentType || 'image/jpeg',
      Metadata: {
        originalName: fileName,
        uploadedAt: new Date().toISOString(),
      },
    };

    const command = new PutObjectCommand(uploadParams);
    await r2Client.send(command);

    // Construct public URL
    const publicUrl = `${process.env.VITE_R2_PUBLIC_URL}/${objectKey}`;

    res.status(200).json({
      success: true,
      url: publicUrl,
      fileName: objectKey,
      message: 'File uploaded successfully to Cloudflare R2',
    });

  } catch (error) {
    console.error('R2 upload error:', error);
    res.status(500).json({
      error: 'Failed to upload to Cloudflare R2',
      details: error.message,
    });
  }
}