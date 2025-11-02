# 🚀 Quick Reference Card

## Start Development (Copy-Paste Ready)

```bash
# Terminal Command
npm run dev:full
```

**Expected Output:**
```
🚀 Development API server running on http://localhost:3001
✅ All handlers loaded successfully
VITE v5.4.10 ready in 288 ms
➜  Local:   http://localhost:8080/
```

---

## URLs

| Environment | URL | Purpose |
|-------------|-----|---------|
| Development | http://localhost:8080 | Frontend |
| Dev API | http://localhost:3001 | Backend APIs |
| Production | https://your-domain.com | Live site |
| Vercel Admin | https://vercel.com/dashboard | Deployments |

---

## API Endpoints

```
LOCAL (Development)
├─ POST   http://localhost:3001/api/create-razorpay-order
├─ POST   http://localhost:3001/api/verify-razorpay-signature
├─ POST   http://localhost:3001/api/upload-r2-image
├─ DELETE http://localhost:3001/api/delete-r2-image
├─ POST   http://localhost:3001/api/send-email
└─ GET    http://localhost:3001/api/health

FRONTEND PROXY (Automatic)
├─ POST   http://localhost:8080/api/create-razorpay-order
└─ (All endpoints available via proxy)

PRODUCTION (Vercel Serverless)
├─ POST   https://your-domain.com/api/create-razorpay-order
└─ (All endpoints deployed as serverless functions)
```

---

## Environment Variables

**Location:** `.env.local` (in project root)

**Required:**
```env
VITE_RAZORPAY_KEY_ID=rzp_xxx
RAZORPAY_KEY_SECRET=secret_xxx
CLOUDFLARE_R2_BUCKET_NAME=vedhatrendz-images
CLOUDFLARE_R2_ENDPOINT=https://xxx.r2.cloudflarestorage.com
CLOUDFLARE_R2_ACCESS_KEY_ID=xxx
CLOUDFLARE_R2_SECRET_ACCESS_KEY=xxx
```

---

## Common Commands

```bash
# Development
npm run dev:full          # Both servers
npm run dev:api           # Just API server
npm run dev               # Just Vite frontend

# Production
npm run build             # Build for production
npm run preview           # Preview production build

# Utility
npm run lint              # Check for errors
npm run type-check        # Check TypeScript
npm run build:prod        # Build with prod settings
```

---

## File Locations

```
vedhatrendz/
├─ dev-api-server.js         ← Dev API server
├─ vite.config.ts            ← Vite proxy config
├─ vercel.json               ← Production config
├─ index.html                ← CSP headers here
├─ .env.local                ← Environment variables
├─ api/                       ← Serverless functions
│  ├─ create-razorpay-order.js
│  ├─ verify-razorpay-signature.js
│  ├─ upload-r2-image.js
│  ├─ delete-r2-image.js
│  └─ send-email.cjs
└─ src/                       ← React code
   ├─ components/
   │  ├─ Checkout.tsx        ← Payment component
   │  └─ ColorManager.tsx    ← Dynamic colors
   └─ ...
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| 404 on /api/xxx | Run `npm run dev:full` (both servers needed) |
| Port 8080 in use | `taskkill /IM node.exe /F` then restart |
| Port 3001 in use | `taskkill /IM node.exe /F` then restart |
| Missing env vars | Check `.env.local` exists and has all vars |
| Build fails | Run `npm install` then `npm run build` |
| Razorpay not working | Check `VITE_RAZORPAY_KEY_ID` in `.env.local` |

---

## Testing Checkout (Step by Step)

1. **Start dev:** `npm run dev:full`
2. **Open:** http://localhost:8080
3. **Add products:** Browse and add to cart
4. **Go to cart:** Click cart icon
5. **Checkout:** Click "Proceed to Checkout"
6. **Fill form:** Enter shipping details
7. **Review order:** Check order summary
8. **Pay:** Click "Proceed with Razorpay"
9. **Enter card:** Use test card
   - Card: `4111 1111 1111 1111`
   - Date: Any future date (MM/YY)
   - CVV: Any 3 digits
10. **Complete:** Click pay
11. ✅ **Success!** Order confirmed

---

## Git Commands (Version Control)

```bash
# Check status
git status

# Add changes
git add .

# Commit changes
git commit -m "Fix Razorpay and dev server"

# Push to GitHub
git push origin main

# Pull latest
git pull origin main
```

---

## Production Deployment

```bash
# 1. Verify build
npm run build

# 2. Deploy to Vercel
vercel --prod

# 3. Test production
https://your-production-url.com
```

---

## Documentation Files

| File | Purpose |
|------|---------|
| `FIX_SUMMARY.md` | Complete fix summary |
| `DEV_SETUP_COMPLETE.md` | Detailed setup guide |
| `API_ENDPOINTS.md` | API documentation |
| `DEV_API_SERVER_SETUP.md` | Dev server details |
| `QUICK_START_COLORS.md` | Color system guide |

---

## Keyboard Shortcuts

```
Ctrl+C          Stop server
Ctrl+F5         Hard refresh browser
F12             Open DevTools
Ctrl+Shift+N    New incognito window
```

---

## Browser DevTools (Debugging)

```
F12 → Network tab → XHR filter
→ Look for /api/create-razorpay-order
  → Check Status (should be 200, not 404)
  → Check Response (should have order ID)
  → Check Request Headers (Content-Type should be application/json)
```

---

## Status Check

```bash
# Check if servers are running
curl http://localhost:3001/api/health
curl http://localhost:8080/api/health
```

Expected response:
```json
{"status":"OK","message":"Development API server is running"}
```

---

## Key Points to Remember

✅ **Always run both servers:** `npm run dev:full`
✅ **Port 8080:** Frontend (Vite)
✅ **Port 3001:** Backend API (Express)
✅ **Proxy:** /api → localhost:3001 (automatic)
✅ **Env vars:** Required in `.env.local`
✅ **CSP headers:** Already configured for Razorpay
✅ **Production:** Uses Vercel serverless functions

---

## Emergency Restart

```bash
# Nuclear option - kills everything and starts fresh
taskkill /IM node.exe /F
npm install
npm run dev:full
```

---

**Remember:** When in doubt, restart the servers! 🔄

Last Updated: November 2, 2025
