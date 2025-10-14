# ProductManager Migration Guide to Cloudflare R2

Since the ProductManager.tsx file appears to have some corruption, here's a step-by-step guide to manually migrate it to use Cloudflare R2:

## Step 1: Update Imports

Replace these import lines:

```tsx
// OLD IMPORTS (Remove these)
import MultiImageUpload from '@/components/MultiImageUpload';
import { ImageKitService, ImageUploadResult } from '@/services/imagekitService';
import { ThumbnailImage } from '@/components/OptimizedImages';

// NEW IMPORTS (Add these)
import R2MultiImageUpload, { ImageUploadResult } from '@/components/R2MultiImageUpload';
import { ThumbnailImage } from '@/components/R2OptimizedImages';
```

## Step 2: Replace MultiImageUpload Components

Find all instances of `<MultiImageUpload` and replace with `<R2MultiImageUpload`:

### Main Product Images Section:
```tsx
// OLD
<MultiImageUpload
  onImagesUploaded={setUploadedImages}
  existingImages={uploadedImages}
  maxImages={5}
/>

// NEW
<R2MultiImageUpload
  onImagesUploaded={setUploadedImages}
  existingImages={uploadedImages}
  maxImages={5}
  folder="products"
/>
```

### Color-specific Images Section:
```tsx
// OLD
<MultiImageUpload
  onImagesUploaded={(images) => {
    setColorImages(prev => ({
      ...prev,
      [color]: images
    }));
  }}
  existingImages={colorImages[color] || []}
  maxImages={3}
/>

// NEW
<R2MultiImageUpload
  onImagesUploaded={(images) => {
    setColorImages(prev => ({
      ...prev,
      [color]: images
    }));
  }}
  existingImages={colorImages[color] || []}
  maxImages={3}
  folder={`products/colors/${color.toLowerCase()}`}
/>
```

## Step 3: Update Image Deletion Logic

Find the `deleteProduct` mutation and replace the ImageKit deletion logic:

```tsx
// OLD - ImageKit deletion
if (allFileIdsToDelete.length > 0) {
  try {
    const results = await ImageKitService.deleteMultipleImages(allFileIdsToDelete);
    console.log(`Deleted ${results.filter(Boolean).length} of ${allFileIdsToDelete.length} images from ImageKit`);
  } catch (imageError) {
    console.error('Failed to delete images from ImageKit:', imageError);
  }
}

// NEW - R2 deletion
if (allFileIdsToDelete.length > 0) {
  try {
    const deletePromises = allFileIdsToDelete.map(async (imageUrl) => {
      try {
        const response = await fetch('/api/delete-r2-image', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fileUrl: imageUrl }),
        });
        return response.ok;
      } catch (error) {
        console.error(`Failed to delete image ${imageUrl}:`, error);
        return false;
      }
    });
    
    const results = await Promise.all(deletePromises);
    console.log(`Deleted ${results.filter(Boolean).length} of ${allFileIdsToDelete.length} images from R2`);
  } catch (imageError) {
    console.error('Failed to delete images from R2:', imageError);
  }
}
```

## Step 4: Remove fileId References

Find these lines and update them:

```tsx
// OLD - Remove fileId mapping
colorImageFileIds[color] = images.map(img => img.fileId || '');
image_file_ids: uploadedImages.map(img => img.fileId || ''),

// NEW - R2 doesn't use fileIds
// Remove the colorImageFileIds line entirely
// Remove the image_file_ids line from the product creation
```

## Step 5: Update Product Interface (Optional)

If you want to clean up the interfaces, you can remove references to `image_file_ids` and `color_image_file_ids` since R2 doesn't use them.

## Step 6: Test the Changes

After making these changes:

1. Make sure you have the R2 environment variables set
2. Test uploading new products
3. Test deleting products with images
4. Verify images display correctly with the R2 components

## If File is Corrupted

If your ProductManager.tsx file is corrupted, you can:

1. **Reset from git**: `git checkout HEAD -- src/components/ProductManager.tsx`
2. **Manual restore**: Copy from a backup or rewrite the component
3. **Gradual migration**: Keep both ImageKit and R2 components during transition

## Benefits After Migration

✅ **Cost Savings**: No bandwidth fees  
✅ **Better Performance**: Cloudflare CDN  
✅ **Simpler Management**: No file IDs to track  
✅ **Auto WebP**: Better compression  

Let me know if you need help with any specific part of this migration!