// Comprehensive validation utilities for production deployment
export class ValidationUtils {
  
  // Email validation with comprehensive regex
  static validateEmail(email: string): { isValid: boolean; error?: string } {
    if (!email?.trim()) {
      return { isValid: false, error: 'Email is required' };
    }
    
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    
    if (!emailRegex.test(email.trim())) {
      return { isValid: false, error: 'Please enter a valid email address' };
    }
    
    if (email.length > 254) {
      return { isValid: false, error: 'Email address is too long' };
    }
    
    return { isValid: true };
  }

  // Phone validation for Indian numbers
  static validateIndianPhone(phone: string): { isValid: boolean; error?: string } {
    if (!phone?.trim()) {
      return { isValid: false, error: 'Phone number is required' };
    }
    
    // Remove all non-digit characters
    const cleanPhone = phone.replace(/\D/g, '');
    
    // Check for valid Indian mobile number (10 digits starting with 6, 7, 8, or 9)
    const phoneRegex = /^[6-9]\d{9}$/;
    
    if (!phoneRegex.test(cleanPhone)) {
      return { 
        isValid: false, 
        error: 'Please enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9' 
      };
    }
    
    return { isValid: true };
  }

  // Name validation
  static validateName(name: string, fieldName = 'Name'): { isValid: boolean; error?: string } {
    if (!name?.trim()) {
      return { isValid: false, error: `${fieldName} is required` };
    }
    
    if (name.trim().length < 2) {
      return { isValid: false, error: `${fieldName} must be at least 2 characters long` };
    }
    
    if (name.trim().length > 50) {
      return { isValid: false, error: `${fieldName} must be less than 50 characters` };
    }
    
    // Allow only letters, spaces, apostrophes, and hyphens
    const nameRegex = /^[a-zA-Z\s'-]+$/;
    if (!nameRegex.test(name.trim())) {
      return { isValid: false, error: `${fieldName} can only contain letters, spaces, apostrophes, and hyphens` };
    }
    
    return { isValid: true };
  }

  // Password validation
  static validatePassword(password: string): { isValid: boolean; error?: string } {
    if (!password) {
      return { isValid: false, error: 'Password is required' };
    }
    
    if (password.length < 8) {
      return { isValid: false, error: 'Password must be at least 8 characters long' };
    }
    
    if (password.length > 128) {
      return { isValid: false, error: 'Password must be less than 128 characters' };
    }
    
    // Check for at least one uppercase, one lowercase, one digit, and one special character
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasDigit = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
    
    if (!(hasUppercase && hasLowercase && hasDigit && hasSpecialChar)) {
      return { 
        isValid: false, 
        error: 'Password must contain at least one uppercase letter, one lowercase letter, one digit, and one special character' 
      };
    }
    
    return { isValid: true };
  }

  // Price validation
  static validatePrice(price: string | number): { isValid: boolean; error?: string } {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    
    if (isNaN(numPrice)) {
      return { isValid: false, error: 'Price must be a valid number' };
    }
    
    if (numPrice <= 0) {
      return { isValid: false, error: 'Price must be greater than 0' };
    }
    
    if (numPrice > 1000000) {
      return { isValid: false, error: 'Price cannot exceed ₹10,00,000' };
    }
    
    return { isValid: true };
  }

  // Product code validation
  static validateProductCode(code: string): { isValid: boolean; error?: string } {
    if (!code?.trim()) {
      return { isValid: false, error: 'Product code is required' };
    }
    
    // Allow alphanumeric, hyphens, and underscores, 3-20 characters
    const codeRegex = /^[A-Z0-9_-]{3,20}$/;
    if (!codeRegex.test(code.trim().toUpperCase())) {
      return { 
        isValid: false, 
        error: 'Product code must be 3-20 characters long and contain only letters, numbers, hyphens, and underscores' 
      };
    }
    
    return { isValid: true };
  }

  // Address validation
  static validateAddress(address: string): { isValid: boolean; error?: string } {
    if (!address?.trim()) {
      return { isValid: false, error: 'Address is required' };
    }
    
    if (address.trim().length < 10) {
      return { isValid: false, error: 'Address must be at least 10 characters long' };
    }
    
    if (address.trim().length > 200) {
      return { isValid: false, error: 'Address must be less than 200 characters' };
    }
    
    return { isValid: true };
  }

  // Indian PIN code validation
  static validatePincode(pincode: string): { isValid: boolean; error?: string } {
    if (!pincode?.trim()) {
      return { isValid: false, error: 'PIN code is required' };
    }
    
    const pincodeRegex = /^[1-9][0-9]{5}$/;
    if (!pincodeRegex.test(pincode.trim())) {
      return { isValid: false, error: 'Please enter a valid 6-digit Indian PIN code' };
    }
    
    return { isValid: true };
  }

  // Rating validation
  static validateRating(rating: number): { isValid: boolean; error?: string } {
    if (rating < 1 || rating > 5) {
      return { isValid: false, error: 'Rating must be between 1 and 5 stars' };
    }
    
    return { isValid: true };
  }

  // File validation
  static validateFile(file: File, options: {
    maxSize?: number; // in MB
    allowedTypes?: string[];
    maxDimensions?: { width: number; height: number };
  } = {}): { isValid: boolean; error?: string } {
    const { maxSize = 5, allowedTypes = ['image/jpeg', 'image/png', 'image/webp'] } = options;
    
    if (!allowedTypes.includes(file.type)) {
      return { 
        isValid: false, 
        error: `File type not supported. Allowed types: ${allowedTypes.join(', ')}` 
      };
    }
    
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSize) {
      return { 
        isValid: false, 
        error: `File size must be less than ${maxSize}MB. Current size: ${fileSizeMB.toFixed(1)}MB` 
      };
    }
    
    return { isValid: true };
  }

  // Comprehensive form validation
  static validateShippingForm(data: {
    fullName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
  }): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    const nameCheck = this.validateName(data.fullName, 'Full name');
    if (!nameCheck.isValid) errors.push(nameCheck.error!);
    
    const emailCheck = this.validateEmail(data.email);
    if (!emailCheck.isValid) errors.push(emailCheck.error!);
    
    const phoneCheck = this.validateIndianPhone(data.phone);
    if (!phoneCheck.isValid) errors.push(phoneCheck.error!);
    
    const addressCheck = this.validateAddress(data.address);
    if (!addressCheck.isValid) errors.push(addressCheck.error!);
    
    const cityCheck = this.validateName(data.city, 'City');
    if (!cityCheck.isValid) errors.push(cityCheck.error!);
    
    const stateCheck = this.validateName(data.state, 'State');
    if (!stateCheck.isValid) errors.push(stateCheck.error!);
    
    const pincodeCheck = this.validatePincode(data.pincode);
    if (!pincodeCheck.isValid) errors.push(pincodeCheck.error!);
    
    return { isValid: errors.length === 0, errors };
  }

  // Sanitize HTML input to prevent XSS
  static sanitizeInput(input: string): string {
    return input
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }

  // Rate limiting check (client-side basic implementation)
  static checkRateLimit(key: string, maxAttempts: number = 5, windowMs: number = 60000): boolean {
    const now = Date.now();
    const attempts = JSON.parse(localStorage.getItem(`rate_limit_${key}`) || '[]');
    
    // Remove expired attempts
    const validAttempts = attempts.filter((timestamp: number) => now - timestamp < windowMs);
    
    if (validAttempts.length >= maxAttempts) {
      return false;
    }
    
    // Add current attempt
    validAttempts.push(now);
    localStorage.setItem(`rate_limit_${key}`, JSON.stringify(validAttempts));
    
    return true;
  }
}

// Environment validation for production
export class EnvironmentValidator {
  static validateProductionConfig(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // Check required environment variables
    const requiredEnvVars = [
      'VITE_FIREBASE_API_KEY',
      'VITE_FIREBASE_AUTH_DOMAIN',
      'VITE_FIREBASE_PROJECT_ID',
      'VITE_R2_PUBLIC_URL'
    ];
    
    requiredEnvVars.forEach(envVar => {
      if (!import.meta.env[envVar]) {
        errors.push(`Missing required environment variable: ${envVar}`);
      }
    });
    
    // Validate URLs
    const urls = {
      'VITE_FIREBASE_AUTH_DOMAIN': import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      'VITE_R2_PUBLIC_URL': import.meta.env.VITE_R2_PUBLIC_URL
    };
    
    Object.entries(urls).forEach(([key, url]) => {
      if (url && !this.isValidUrl(url)) {
        errors.push(`Invalid URL format for ${key}: ${url}`);
      }
    });
    
    return { isValid: errors.length === 0, errors };
  }
  
  private static isValidUrl(string: string): boolean {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  }
}