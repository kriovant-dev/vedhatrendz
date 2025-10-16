import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import multer from 'multer';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env.local with explicit path
const envPath = join(__dirname, '.env.local');
console.log('Loading env from:', envPath);
console.log('File exists:', fs.existsSync(envPath));

dotenv.config({ path: envPath });

const app = express();
const PORT = 3001;

// Debug: Log environment variables
console.log('🔧 Environment Variables:');
console.log('CLOUDFLARE_R2_BUCKET_NAME:', process.env.CLOUDFLARE_R2_BUCKET_NAME);
console.log('CLOUDFLARE_R2_ENDPOINT:', process.env.CLOUDFLARE_R2_ENDPOINT);
console.log('CLOUDFLARE_R2_ACCESS_KEY_ID:', process.env.CLOUDFLARE_R2_ACCESS_KEY_ID ? '✓ Set' : '✗ Missing');
console.log('CLOUDFLARE_R2_SECRET_ACCESS_KEY:', process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY ? '✓ Set' : '✗ Missing');

// Configure multer for memory storage
const upload = multer({ storage: multer.memoryStorage() });

// Middleware
app.use(cors());
app.use(express.json());

// Import API handlers
const uploadR2Handler = await import('./api/upload-r2-image.js');
const deleteR2Handler = await import('./api/delete-r2-image.js');
const sendEmailHandler = await import('./api/send-email.cjs');

// Wrapper function to adapt Express req/res to our serverless handler
function adaptHandler(handler) {
  return async (req, res) => {
    try {
      await handler.default(req, res);
    } catch (error) {
      console.error('Handler error:', error);
      res.status(500).json({ error: 'Internal server error', details: error.message });
    }
  };
}

// API Routes
app.post('/api/upload-r2-image', upload.single('file'), adaptHandler(uploadR2Handler));
app.delete('/api/delete-r2-image', adaptHandler(deleteR2Handler));
app.post('/api/send-email', adaptHandler(sendEmailHandler));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Development API server is running' });
});

app.listen(PORT, () => {
  console.log(`🚀 Development API server running on http://localhost:${PORT}`);
  console.log('📝 Available endpoints:');
  console.log('  POST /api/upload-r2-image');
  console.log('  DELETE /api/delete-r2-image');
  console.log('  POST /api/send-email');
  console.log('  GET /api/health');
});