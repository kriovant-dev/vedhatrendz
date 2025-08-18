import React from 'react';
import { ImageKitProvider } from '@imagekit/react';

// Environment variables
const IMAGEKIT_URL_ENDPOINT = import.meta.env.VITE_IMAGEKIT_URL_ENDPOINT || 'https://ik.imagekit.io/your_imagekit_id';

interface ImageKitProviderWrapperProps {
  children: React.ReactNode;
}

/**
 * Global ImageKit provider to avoid repeating the provider in individual components
 * 
 * Usage:
 * In your main App.tsx or layout component:
 * 
 * import { ImageKitProviderWrapper } from './components/ImageKitProviderWrapper';
 * 
 * function App() {
 *   return (
 *     <ImageKitProviderWrapper>
 *       Your app components
 *     </ImageKitProviderWrapper>
 *   );
 * }
 */
export const ImageKitProviderWrapper: React.FC<ImageKitProviderWrapperProps> = ({ children }) => {
  return (
    <ImageKitProvider 
      urlEndpoint={IMAGEKIT_URL_ENDPOINT}
      // The ImageKitProvider only accepts urlEndpoint and transformationPosition in the current SDK version
      transformationPosition="path"
    >
      {children}
    </ImageKitProvider>
  );
};

export default ImageKitProviderWrapper;
