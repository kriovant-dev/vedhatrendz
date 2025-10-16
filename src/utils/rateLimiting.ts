// Rate limiting hook for production
import { useState, useCallback } from 'react';
import { ValidationUtils } from './validation';

interface RateLimitConfig {
  maxAttempts: number;
  windowMs: number;
  action: string;
}

export const useRateLimit = (config: RateLimitConfig) => {
  const [isBlocked, setIsBlocked] = useState(false);

  const checkRateLimit = useCallback((): boolean => {
    const canProceed = ValidationUtils.checkRateLimit(
      config.action, 
      config.maxAttempts, 
      config.windowMs
    );
    
    if (!canProceed) {
      setIsBlocked(true);
      // Unblock after window expires
      setTimeout(() => setIsBlocked(false), config.windowMs);
    }
    
    return canProceed;
  }, [config]);

  return { checkRateLimit, isBlocked };
};