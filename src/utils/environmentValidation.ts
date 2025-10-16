// Production environment validation and setup
import { EnvironmentValidator } from '@/utils/validation';

// Validate environment on app initialization
const validateEnvironment = () => {
  if (import.meta.env.PROD) {
    const validation = EnvironmentValidator.validateProductionConfig();
    
    if (!validation.isValid) {
      console.error('❌ Production Environment Validation Failed:');
      validation.errors.forEach(error => console.error(`  - ${error}`));
      
      // Show user-friendly error in production
      const errorDiv = document.createElement('div');
      errorDiv.innerHTML = `
        <div style="
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.9);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10000;
          font-family: system-ui, -apple-system, sans-serif;
        ">
          <div style="text-align: center; padding: 2rem;">
            <h1>🔧 Configuration Error</h1>
            <p style="margin: 1rem 0;">The application is not properly configured.</p>
            <p style="font-size: 0.9em; opacity: 0.8;">Please contact support if this issue persists.</p>
          </div>
        </div>
      `;
      document.body.appendChild(errorDiv);
      
      // Don't throw in production, just log and show friendly message
      return false;
    }
    
    console.log('✅ Production environment validation passed');
  }
  
  return true;
};

// Initialize on load
validateEnvironment();

export default validateEnvironment;