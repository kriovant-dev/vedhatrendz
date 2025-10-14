import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3';

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
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { fileName } = req.body;

    if (!fileName) {
      return res.status(400).json({ error: 'Missing fileName' });
    }

    const deleteParams = {
      Bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME,
      Key: fileName,
    };

    const command = new DeleteObjectCommand(deleteParams);
    await r2Client.send(command);

    res.status(200).json({
      success: true,
      message: 'File deleted successfully from Cloudflare R2',
      fileName,
    });

  } catch (error) {
    console.error('R2 delete error:', error);
    res.status(500).json({
      error: 'Failed to delete from Cloudflare R2',
      details: error.message,
    });
  }
}