import { useState } from 'react';
import { useUser } from '@clerk/clerk-react';

export const useClerkAuth = () => {
  const { user, isSignedIn, isLoaded } = useUser();
  const [showPhoneAuth, setShowPhoneAuth] = useState(false);

  const openPhoneAuth = () => setShowPhoneAuth(true);
  const closePhoneAuth = () => setShowPhoneAuth(false);

  const handleAuthSuccess = () => {
    setShowPhoneAuth(false);
    // You can add additional success handling here
  };

  return {
    user,
    isSignedIn,
    isLoaded,
    showPhoneAuth,
    openPhoneAuth,
    closePhoneAuth,
    handleAuthSuccess,
  };
};

export default useClerkAuth;
