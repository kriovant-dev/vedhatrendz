// Clerk configuration and utilities
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error('Missing VITE_CLERK_PUBLISHABLE_KEY environment variable');
}

// Phone number utilities
export const formatPhoneNumber = (phone: string): string => {
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');
  
  // If it starts with country code, use as is
  if (digits.startsWith('91') && digits.length === 12) {
    return `+${digits}`;
  }
  
  // If it's a 10-digit Indian number, add +91
  if (digits.length === 10) {
    return `+91${digits}`;
  }
  
  // Return with + if not present
  return digits.startsWith('+') ? digits : `+${digits}`;
};

export const validatePhoneNumber = (phone: string): boolean => {
  const formatted = formatPhoneNumber(phone);
  const digits = formatted.replace(/\D/g, '');
  
  // Indian phone numbers should be 12 digits with country code (91 + 10 digits)
  return digits.length >= 10 && digits.length <= 15;
};

// User session utilities
export const getUserFromClerk = (user: any) => {
  if (!user) return null;
  
  return {
    id: user.id,
    phone: user.primaryPhoneNumber?.phoneNumber || null,
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    fullName: user.fullName || '',
    imageUrl: user.imageUrl || '',
    createdAt: user.createdAt,
    lastSignInAt: user.lastSignInAt,
  };
};

export default {
  formatPhoneNumber,
  validatePhoneNumber,
  getUserFromClerk,
};