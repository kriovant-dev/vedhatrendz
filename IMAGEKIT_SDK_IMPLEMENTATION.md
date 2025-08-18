# ImageKit SDK Implementation Guide

This file provides examples of how to update your components to use the new ImageKit SDK components.

## ProductDetail.tsx Example

Here's how to update the ProductDetail page to use the IKImage components:

```tsx
// Import the IKImage components
import { IKImage, IKThumbnail, IKProductImage } from '@/components/ui/IKImage';

// Replace the current image section:
<div className="aspect-[3/4] rounded-lg overflow-hidden bg-muted">
  {getDisplayImages().length > 0 ? (
    <ResponsiveImage
      src={getDisplayImages()[currentImageIndex]}
      alt={product.name}
      width={800}
      className="w-full h-full"
      loadingStrategy="eager" // Load main product image eagerly
      enableBlurEffect={true}
    />
  ) : (
    <div className="w-full h-full bg-gradient-primary flex items-center justify-center">
      <div className="text-center text-primary-foreground">
        <div className="mb-2 text-4xl sm:text-6xl">👗</div>
        <div className="text-sm sm:text-lg font-medium">{product.category}</div>
      </div>
    </div>
  )}
</div>

// With this optimized version:
<div className="aspect-[3/4] rounded-lg overflow-hidden bg-muted">
  {getDisplayImages().length > 0 ? (
    <IKProductImage
      src={getDisplayImages()[currentImageIndex]}
      alt={product.name}
      className="w-full h-full object-cover"
    />
  ) : (
    <div className="w-full h-full bg-gradient-primary flex items-center justify-center">
      <div className="text-center text-primary-foreground">
        <div className="mb-2 text-4xl sm:text-6xl">👗</div>
        <div className="text-sm sm:text-lg font-medium">{product.category}</div>
      </div>
    </div>
  )}
</div>

// Replace thumbnail images:
<ThumbnailImage
  src={image}
  alt={`${product.name} view ${index + 1}`}
  size={80}
  className="w-full h-full"
/>

// With:
<IKThumbnail
  src={image}
  alt={`${product.name} view ${index + 1}`}
  size={80}
  className="w-full h-full"
/>
```

## FeaturedProducts.tsx Example

Here's how to update the FeaturedProducts component:

```tsx
// Import the IKImage component
import { IKImage } from '@/components/ui/IKImage';

// Replace:
<ResponsiveImage
  src={product.images[0]}
  alt={product.name}
  width={400}
  height={533}
  className="w-full h-full transition-transform duration-300 group-hover:scale-105"
  sizes="(max-width: 768px) 100vw, 400px"
/>

// With:
<IKImage
  src={product.images[0]}
  alt={product.name}
  width={400}
  height={533}
  className="w-full h-full transition-transform duration-300 group-hover:scale-105"
  sizes="(max-width: 768px) 100vw, 400px"
  transformations={[{ quality: 75, format: 'webp' }]}
/>
```

## ProductManager.tsx Example

Here's how to update the ProductManager component:

```tsx
// Import the IKImage component
import { IKThumbnail } from '@/components/ui/IKImage';

// Replace:
<ThumbnailImage
  src={product.images[0]}
  alt={product.name}
  size={40}
  className="w-10 h-10 rounded"
/>

// With:
<IKThumbnail
  src={product.images[0]}
  alt={product.name}
  size={40}
  className="w-10 h-10 rounded"
/>
```

## Advanced Transformations Example

The official SDK allows advanced transformations:

```tsx
// Background removal:
<IKImage
  src={product.images[0]}
  alt={product.name}
  width={800}
  transformations={[{ aiRemoveBackground: true }]}
/>

// Image with overlay:
<IKImage
  src={product.images[0]}
  alt={product.name}
  width={800}
  transformations={[{
    overlay: {
      type: "image",
      input: "logo.png",
      transformation: [{ width: 100 }]
    }
  }]}
/>

// With text overlay:
<IKImage
  src={product.images[0]}
  alt={product.name}
  width={800}
  transformations={[{
    overlay: {
      type: "text",
      text: "SALE!",
      transformation: [{ fontSize: 30, fontColor: "FF0000" }]
    }
  }]}
/>
```

## Using ImageKitProvider

For better performance, wrap your App component with ImageKitProvider:

```tsx
// In your App.tsx or main.tsx:
import { ImageKitProvider } from '@imagekit/react';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ImageKitProvider 
      urlEndpoint={import.meta.env.VITE_IMAGEKIT_URL_ENDPOINT || 'https://ik.imagekit.io/your_imagekit_id'}>
      <App />
    </ImageKitProvider>
  </React.StrictMode>
);

// Then in your components, you don't need to wrap each Image with ImageKitProvider:
<Image 
  src={product.images[0]}
  alt={product.name}
  width={800}
  transformation={[{ quality: 75, format: 'webp' }]}
/>
```
