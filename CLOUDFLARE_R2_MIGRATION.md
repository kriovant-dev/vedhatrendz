# Migration from ImageKit to Cloudflare R2

## Why Migrate to Cloudflare R2?

- **Cost Savings**: No egress/bandwidth fees (vs ImageKit's usage-based billing)
- **Free Tier**: 10GB storage/month free forever
- **Better Performance**: Cloudflare's global CDN
- **No Transformation Costs**: ImageKit charges for transformations

## Environment Variables Setup

Add these to your `.env.local` file:

```env
# Cloudflare R2 Configuration
VITE_R2_PUBLIC_URL=https://your-custom-domain.com
VITE_R2_ACCOUNT_ID=your-account-id
VITE_R2_BUCKET_NAME=vedhatrendz-images

# Server-side R2 credentials (for API endpoints)
CLOUDFLARE_R2_ACCESS_KEY_ID=your-access-key-id
CLOUDFLARE_R2_SECRET_ACCESS_KEY=your-secret-access-key
CLOUDFLARE_R2_BUCKET_NAME=vedhatrendz-images
CLOUDFLARE_R2_ACCOUNT_ID=your-account-id
```

## How to Get R2 Credentials

1. **Sign up for Cloudflare** (if you haven't already)
2. **Create R2 bucket**:
   - Go to R2 Object Storage in your Cloudflare dashboard
   - Create a new bucket named `vedhatrendz-images`
   - Enable public access for the bucket

3. **Get API credentials**:
   - Go to "My Profile" → "API Tokens"
   - Create a new R2 token with Object:Edit permissions
   - Note down the Access Key ID and Secret Access Key

4. **Set up custom domain** (optional but recommended):
   - In R2 bucket settings, add a custom domain
   - This gives you a branded URL like `https://images.vedhatrendz.com`

## Installation

Install the AWS SDK for R2 compatibility:

```bash
npm install @aws-sdk/client-s3
```

## Migration Steps

### Step 1: Update vercel.json

```json
{
  "functions": {
    "api/upload-r2-image.js": {
      "maxDuration": 30
    },
    "api/delete-r2-image.js": {
      "maxDuration": 30
    }
  }
}
```

### Step 2: Replace Components

Replace these imports in your components:

```tsx
// OLD (ImageKit)
import { ThumbnailImage, LazyImage, BlurUpImage } from '@/components/OptimizedImages';
import MultiImageUpload from '@/components/MultiImageUpload';

// NEW (Cloudflare R2)
import { ThumbnailImage, LazyImage, BlurUpImage } from '@/components/R2OptimizedImages';
import R2MultiImageUpload from '@/components/R2MultiImageUpload';
```

### Step 3: Update ProductManager.tsx

```tsx
// Import R2 components
import R2MultiImageUpload from '@/components/R2MultiImageUpload';
import { ThumbnailImage } from '@/components/R2OptimizedImages';

// In your component, replace:
<MultiImageUpload 
  onImagesUploaded={handleImagesUploaded}
  existingImages={existingImages}
/>

// With:
<R2MultiImageUpload 
  onImagesUploaded={handleImagesUploaded}
  existingImages={existingImages}
  folder="products"
/>
```

### Step 4: Update App.tsx

Remove the ImageKit provider:

```tsx
// REMOVE this:
import { ImageKitProviderWrapper } from '@/components/ImageKitProviderWrapper';

function App() {
  return (
    // Remove the ImageKitProviderWrapper
    <div>
      {/* Your app content */}
    </div>
  );
}
```

### Step 5: Update Image URLs in Database

If you have existing products with ImageKit URLs, you'll need to migrate them. You can do this gradually:

1. **New products**: Will automatically use R2
2. **Existing products**: Update them gradually or run a migration script

## Cost Comparison

### ImageKit (Current)
- Bandwidth charges: $0.04-0.20 per GB
- Storage: $0.035 per GB/month  
- Transformations: $0.50-2.00 per 1000 requests

### Cloudflare R2 (New)
- Bandwidth: **FREE** (no egress fees)
- Storage: **FREE** up to 10GB/month, then $0.015 per GB
- Transformations: **FREE** with Cloudflare Images

## Expected Savings

For a typical e-commerce site:
- **90% reduction** in bandwidth costs
- **60% reduction** in storage costs  
- **100% reduction** in transformation costs

## Rollback Plan

If you need to rollback:
1. Keep the old ImageKit components
2. Switch imports back
3. Re-enable ImageKit provider in App.tsx

## Performance Benefits

- **Faster loading**: Cloudflare's global CDN
- **Better caching**: Longer cache times
- **WebP support**: Automatic format optimization
- **Responsive images**: Built-in srcset generation

## Next Steps

1. Set up Cloudflare R2 bucket and get credentials
2. Add environment variables
3. Deploy the new API endpoints
4. Start using R2 components for new products
5. Gradually migrate existing images

Would you like me to help you set up the Cloudflare R2 bucket or update specific components?