# 🧪 Quick Test: Product Deletion with Image Cleanup

## How to Test It

### Step 1: Start Development Server
```bash
npm run dev:full
```

### Step 2: Go to Admin Panel
1. Open http://localhost:8080/admin
2. Login as admin
3. Go to "Product Manager" tab

### Step 3: Create Test Product
1. Click "Add Product"
2. Fill in product details
3. Upload 2-3 images for main product
4. (Optional) Upload color-specific images for 2 colors
5. Click "Save Product"

### Step 4: Delete Product and Check Cleanup
1. Find your test product in the list
2. Click "Delete" button (trash icon)
3. See confirmation dialog with product details
4. Click "Delete Product" button

### Step 5: Verify Deletion
**What you should see:**

✅ **Toast Message**:
```
"Product deleted successfully"
```

✅ **Product List**:
- Product disappears from list
- List refreshes automatically

✅ **Browser Console** (F12):
```
Multiple DELETE requests to /api/delete-r2-image
Each with 200 status
```

✅ **Network Tab** (F12 → Network):
- Filter by `delete-r2-image`
- Should see one DELETE request per image
- Each shows `Status: 200`
- Response: `{ "success": true, "message": "File deleted successfully from Cloudflare R2", "fileName": "..." }`

---

## What Gets Deleted

### From Firebase Database:
- ✅ Product record
- ✅ All metadata
- ✅ Price, category, description, etc.

### From Cloudflare R2:
- ✅ Main product image 1
- ✅ Main product image 2
- ✅ (Any color-specific images)

---

## Example: Product with 5 Images

**Before Deletion:**
```
Database: 1 product record
R2 Storage: 5 image files
  ├─ products/main/img-1.webp
  ├─ products/main/img-2.webp
  ├─ products/colors/red/img-3.webp
  ├─ products/colors/red/img-4.webp
  └─ products/colors/blue/img-5.webp
```

**After Deletion (what happens in ~2 seconds):**
```
Database: ✅ DELETED
R2 Storage: ✅ ALL 5 FILES DELETED
```

---

## Console Output You'll See

When you delete a product with 3 images:

**DevTools Console:**
```
[ProductManager] Deleting product: {product-id}
Failed to delete images from R2: (if network issue - but product still deleted)
```

**DevTools Network Tab:**
```
POST /api/delete-r2-image → 200 OK
POST /api/delete-r2-image → 200 OK
POST /api/delete-r2-image → 200 OK
```

---

## Verify in Cloudflare Dashboard

1. Go to https://dash.cloudflare.com
2. Navigate to R2 bucket
3. Browse `products/` folder
4. Find your test product folder
5. Before delete: See 3 image files
6. After delete: Folder gone or empty

---

## Troubleshooting

### ❌ Product deleted but images remain in R2
- **Cause**: API endpoint not responding
- **Fix**: Check `/api/health` returns 200
- **Verify**: `curl http://localhost:3001/api/health`

### ❌ Delete button does nothing
- **Cause**: JavaScript error
- **Fix**: Check DevTools Console for errors
- **Verify**: Try different product

### ❌ CORS error in console
- **Cause**: Dev server not running or endpoint misconfigured
- **Fix**: Restart `npm run dev:full`
- **Verify**: Check dev-api-server.js is listening

### ❌ Product not deleted from Firebase
- **Cause**: Authentication or database issue
- **Fix**: Check Firebase credentials in .env.local
- **Verify**: Can you edit other products?

---

## Success Indicators

✅ **All of these should be true:**

1. [ ] Toast shows "Product deleted successfully"
2. [ ] Product disappears from admin list
3. [ ] Browser console shows NO errors (only info logs)
4. [ ] Network tab shows DELETE requests with 200 status
5. [ ] Cloudflare R2 bucket no longer has product images
6. [ ] Firebase no longer shows product in database
7. [ ] Refreshing page still shows product deleted
8. [ ] No orphaned images in R2 storage

---

## Files Involved in This Flow

```
src/components/ProductManager.tsx
  └─ deleteProductMutation (lines 259-330)
  
api/delete-r2-image.js
  └─ DELETE endpoint handler
  
dev-api-server.js
  └─ DELETE /api/delete-r2-image route (line 68)

vercel.json
  └─ "api/delete-r2-image.js" function registration
```

---

## Quick Command to Check Server

```bash
# In PowerShell, check if dev server is running
curl http://localhost:3001/api/health

# Should return:
# { "status": "OK", "message": "Development API server is running" }
```

---

## Expected Request Format

When deleting product with image:
```
DELETE /api/delete-r2-image

Body:
{
  "fileName": "products/main/product-1-abc123.webp"
}

Response:
{
  "success": true,
  "message": "File deleted successfully from Cloudflare R2",
  "fileName": "products/main/product-1-abc123.webp"
}
```

---

**Status**: ✅ Ready to test!

Go ahead and create a test product, then delete it. You should see it completely removed from both the database AND Cloudflare R2 storage! 🎉
