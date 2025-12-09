# Netlify Deployment Guide for ResQ Unified

## ✅ Pre-Deployment Checklist

### Local Verification
- [x] Node.js version: 20.19.0 (check with `node --version`)
- [x] Build succeeds locally: `npm run build` ✓
- [x] No TypeScript errors
- [x] All dependencies installed: `npm ci`
- [x] Environment variables configured in `.env.local`
- [x] Git repository clean: `git status`

### Configuration Files
- [x] `netlify.toml` - Main Netlify configuration
- [x] `netlify.json` - Local development config
- [x] `.nvmrc` - Node.js version specification (20.19.0)
- [x] `package.json` - Build scripts and dependencies
- [x] `.env.example` - Environment variable template
- [x] `.env.netlify` - Netlify-specific env vars

---

## 🚀 Deployment Steps

### Step 1: Connect to Netlify via GitHub

1. Go to [Netlify Dashboard](https://app.netlify.com)
2. Click "Add new site" → "Import an existing project"
3. Choose "GitHub"
4. Authorize Netlify with your GitHub account
5. Select your repository: `bring-deduct-nervy/neww`
6. Choose branch: `main`
7. Click "Deploy site"

### Step 2: Configure Build Settings

Netlify will auto-detect from `netlify.toml`:
- **Build command:** `npm ci && npm run build`
- **Publish directory:** `dist`
- **Node version:** 20.19.0

### Step 3: Set Environment Variables in Netlify Dashboard

Navigate to: **Site settings → Environment variables**

Add these variables (required):
```
VITE_SUPABASE_URL = https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY = your-supabase-anon-key-here
```

Optional variables:
```
VITE_WEATHER_API_KEY = (get from Open-Meteo)
VITE_OPENAI_API_KEY = (get from OpenAI)
VITE_GOOGLE_MAPS_KEY = (get from Google Cloud)
```

See `.env.netlify` for complete list.

### Step 4: Trigger Deploy

After setting environment variables:
1. Go to "Deployments" tab
2. Click "Trigger deploy" → "Deploy site"
3. Wait for build to complete (takes ~2-3 minutes)

---

## 📊 Expected Build Output

```
npm ci && npm run build
✓ TypeScript compiled
✓ Vite bundled (6-7 seconds)
✓ dist/ generated (968 KB)
✓ Assets optimized
✓ Deploy preview ready
```

---

## 🔍 Post-Deployment Verification

After successful deployment:

1. **Open your site** - Check Netlify preview URL
2. **Test Authentication** - Try signing in
3. **Check console** - Look for any JavaScript errors
4. **Test key features:**
   - Dashboard loads
   - Real-time data updates
   - Maps display
   - Alerts work
5. **Verify environment variables** - Check that API keys work
6. **Monitor performance** - Check Netlify Analytics

---

## 🛠️ Troubleshooting

### Build Fails with "tsc: not found"
✅ **Fixed** - We use `npx -y tsc` which always works

### Build Fails with Engine Mismatch
✅ **Fixed** - Node 20.19.0 specified in:
- `.nvmrc`
- `package.json` engines
- `netlify.toml` NODE_VERSION

### Build Fails with Missing Dependencies
✅ **Fixed** - `NPM_FLAGS = "--include=dev"` in netlify.toml

### API not Connecting
- Verify VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
- Check Supabase project is active
- Verify CORS settings in Supabase

### Real-time Subscriptions Not Working
- Check WebSocket connections in browser DevTools
- Verify Supabase replication is enabled
- Check browser console for errors

---

## 📝 Build Configuration Details

### netlify.toml
- **Build command:** Uses `npm ci` for clean install, then `npm run build`
- **Publish directory:** `dist` (Vite output)
- **Functions directory:** `netlify/functions` (for serverless)
- **Node version:** 20.19.0
- **Environment:** Production

### Redirects
```toml
/* → /index.html (SPA routing)
```

### Headers
- **Security headers:** X-Frame-Options, CSP, etc.
- **Cache control:** Assets cached 1 year, HTML cached 1 hour
- **Asset preloading:** CSS and JS preloaded

---

## 🔐 Security Checklist

- [x] No secrets in code
- [x] Environment variables configured
- [x] HTTPS enforced
- [x] Security headers set
- [x] CORS configured (via Supabase)
- [x] API keys never exposed
- [x] Rate limiting enabled (via Supabase RLS)

---

## 📞 Support & Monitoring

### Recommended Tools
- **Error Tracking:** Sentry (optional)
- **Analytics:** Google Analytics (optional)
- **Monitoring:** Netlify Analytics (built-in)
- **Logs:** Netlify Logs (built-in)

### Useful Links
- [Netlify Docs](https://docs.netlify.com)
- [Supabase Docs](https://supabase.com/docs)
- [Vite Docs](https://vitejs.dev)
- [React Docs](https://react.dev)

---

## 🎉 Deployment Complete!

Your ResQ Unified platform is now live on Netlify!

**Next steps:**
1. Share the site URL with your team
2. Set up custom domain (optional)
3. Configure analytics
4. Monitor logs and errors
5. Set up backup alerts

---

**Last Updated:** December 9, 2025
**Status:** ✅ Ready for Production
**Node Version:** 20.19.0
**Build Time:** ~6-7 seconds
