# Vercel Environment Variables Setup

To fix the email functionality on Vercel, you need to configure the following environment variables in your Vercel dashboard:

## Required Environment Variables

### SMTP Configuration (Gmail)
```
SMTP_USER=your-gmail@gmail.com
SMTP_PASS=your-app-password
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
```

### Optional Gmail OAuth2 (More Secure)
If you want to use OAuth2 instead of app passwords:
```
GMAIL_CLIENT_ID=your-google-client-id
GMAIL_CLIENT_SECRET=your-google-client-secret
GMAIL_REFRESH_TOKEN=your-google-refresh-token
```

## How to Set Up

### Option 1: Gmail App Password (Easier)
1. Go to your Google Account settings
2. Enable 2-Factor Authentication
3. Generate an App Password for "Mail"
4. Use this app password in `SMTP_PASS`

### Option 2: Gmail OAuth2 (More Secure)
1. Go to Google Cloud Console
2. Create a new project or use existing
3. Enable Gmail API
4. Create OAuth2 credentials
5. Get the refresh token using OAuth2 playground

## Setting Environment Variables in Vercel

1. Go to your Vercel project dashboard
2. Navigate to Settings → Environment Variables
3. Add each variable with its value
4. Make sure to add them for all environments (Production, Preview, Development)

## Testing the API

After deployment, you can test the email API:

### Health Check
```bash
curl https://your-domain.vercel.app/api/health
```

### Simple Test (Environment Check)
```bash
curl https://your-domain.vercel.app/api/simple-test
```

### Test Email (Replace with actual values)
```bash
curl -X POST https://your-domain.vercel.app/api/send-email \
  -H "Content-Type: application/json" \
  -d '{
    "to": "test@example.com",
    "subject": "Test Email",
    "html": "<h1>Test Email</h1><p>This is a test email from VedhaTrendz.</p>"
  }'
```

## Debugging 500 Errors

If you're getting 500 errors, check these steps:

1. **Check Environment Variables**: Visit `/api/health` to see which env vars are missing
2. **Test Simple Function**: Visit `/api/simple-test` to test basic functionality
3. **Check Vercel Function Logs**: Go to Vercel dashboard → Functions → View logs
4. **Common Issues**:
   - Missing `SMTP_USER` or `SMTP_PASS` environment variables
   - Incorrect Gmail app password (should be 16 characters)
   - Gmail account doesn't have 2FA enabled (required for app passwords)
   - Network issues with Gmail SMTP

### Gmail App Password Setup
1. Enable 2-Factor Authentication on your Google account
2. Go to Google Account → Security → 2-Step Verification → App passwords
3. Generate a new app password for "Mail"
4. Copy the 16-character password (no spaces)
5. Set it as `SMTP_PASS` in Vercel environment variables

## Files Updated for Vercel

1. `api/send-email.js` - Serverless function for sending emails
2. `api/health.js` - Health check endpoint
3. `api/test.js` - Test endpoint for debugging
4. `vercel.json` - Vercel configuration
5. `src/services/emailService.ts` - Updated to use correct URLs

## Important Notes

- The email service now automatically detects production environment
- In production, it uses the current domain for API calls
- In development, it still uses localhost:3001
- Make sure all environment variables are set in Vercel dashboard
- The API functions have CORS enabled for cross-origin requests
