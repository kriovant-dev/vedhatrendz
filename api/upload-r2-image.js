import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import formidable from 'formidable';
import fs from 'fs';

// Configure R2 client
const r2Client = new S3Client({
  region: 'auto',
  endpoint: process.env.CLOUDFLARE_R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY || '',
  },
});

// Disable body parsing for multipart forms
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    let file, fileName, folder;

    // Check if running in Express (development) with multer
    if (req.file) {
      // Multer handles the file for Express development server
      file = {
        buffer: req.file.buffer,
        mimetype: req.file.mimetype,
        originalname: req.file.originalname
      };
      fileName = req.body.fileName;
      folder = req.body.folder || 'products';
    } else {
      // Formidable handles the file for Vercel serverless
      const form = formidable({ multiples: false });
      const [fields, files] = await form.parse(req);
      
      const fileData = Array.isArray(files.file) ? files.file[0] : files.file;
      fileName = Array.isArray(fields.fileName) ? fields.fileName[0] : fields.fileName;
      folder = Array.isArray(fields.folder) ? fields.folder[0] : fields.folder || 'products';

      if (!fileData) {
        return res.status(400).json({ error: 'Missing file' });
      }

      file = {
        buffer: fs.readFileSync(fileData.filepath),
        mimetype: fileData.mimetype,
        originalname: fileData.originalFilename
      };
    }

    if (!file || !fileName) {
      return res.status(400).json({ error: 'Missing file or filename' });
    }

    // Create object key with folder structure
    const timestamp = Date.now();
    const sanitizedName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const objectKey = `${folder}/${timestamp}_${sanitizedName}`;

    // Debug logging
    console.log('🔧 Upload Debug:');
    console.log('Bucket:', process.env.CLOUDFLARE_R2_BUCKET_NAME);
    console.log('Object Key:', objectKey);
    console.log('Content Type:', file.mimetype);

    const uploadParams = {
      Bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME,
      Key: objectKey,
      Body: file.buffer,
      ContentType: file.mimetype || 'image/jpeg',
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