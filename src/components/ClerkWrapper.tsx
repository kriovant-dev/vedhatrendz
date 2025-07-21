import { ClerkProvider } from '@clerk/clerk-react';
import React from 'react';

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error('Missing Publishable Key');
}

interface ClerkWrapperProps {
  children: React.ReactNode;
}

const ClerkWrapper: React.FC<ClerkWrapperProps> = ({ children }) => {
  return (
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      {children}
    </ClerkProvider>
  );
};

export default ClerkWrapper;
