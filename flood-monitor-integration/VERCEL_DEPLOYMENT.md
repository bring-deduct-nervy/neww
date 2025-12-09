# 🚀 Vercel Deployment Guide

## Prerequisites
- A [Vercel account](https://vercel.com/signup) (free)
- [Vercel CLI](https://vercel.com/docs/cli) installed (optional but recommended)
- Git repository with your code

## Method 1: Deploy via Vercel Dashboard (Easiest)

### Step 1: Push to GitHub
```bash
git add .
git commit -m "Prepare for Vercel deployment"
git push origin dev-rensith
```

### Step 2: Import Project to Vercel
1. Go to [https://vercel.com/new](https://vercel.com/new)
2. Click **"Import Git Repository"**
3. Select your GitHub repository: `RensithUdara/SriLankan-Flood-Dashboard`
4. Select the branch: `dev-rensith`

### Step 3: Configure Project
- **Framework Preset**: Other
- **Root Directory**: `./` (leave as default)
- **Build Command**: Leave empty (or use `pip install -r requirements.txt`)
- **Output Directory**: Leave empty
- **Install Command**: Leave empty

### Step 4: Deploy
Click **"Deploy"** and wait for the build to complete (usually 1-2 minutes)

### Step 5: Access Your Application
Once deployed, Vercel will provide you with a URL like:
- `https://your-project-name.vercel.app`

Your application will be available at:
- **Frontend Dashboard**: `https://your-project-name.vercel.app/`
- **API Docs**: `https://your-project-name.vercel.app/docs`
- **API Endpoints**: `https://your-project-name.vercel.app/api/*`

---

## Method 2: Deploy via Vercel CLI (Advanced)

### Step 1: Install Vercel CLI
```bash
npm i -g vercel
```

### Step 2: Login to Vercel
```bash
vercel login
```

### Step 3: Deploy from Project Directory
```bash
cd f:\lk_flood_api-main\lk_flood_api-main
vercel
```

Follow the prompts:
- **Set up and deploy**: Yes
- **Which scope**: Select your account
- **Link to existing project**: No (if first time)
- **Project name**: sri-lanka-flood-monitor (or your preferred name)
- **Directory**: `./`

### Step 4: Deploy to Production
```bash
vercel --prod
```

---

## Configuration Details

### vercel.json Explanation
```json
{
  "version": 2,
  "builds": [
    {
      "src": "app/main.py",          // Build FastAPI backend
      "use": "@vercel/python"
    },
    {
      "src": "index.html",            // Build static frontend
      "use": "@vercel/static"
    }
  ],
  "routes": [
    {
      "src": "/",                     // Root serves index.html
      "dest": "/index.html"
    },
    {
      "src": "/dashboard",            // Dashboard alias
      "dest": "/index.html"
    },
    {
      "src": "/api/(.*)",             // API routes to FastAPI
      "dest": "app/main.py"
    },
    {
      "src": "/(.*)",                 // Everything else to FastAPI
      "dest": "app/main.py"
    }
  ]
}
```

### Environment Variables (if needed)
If you need to set environment variables:

**Via Dashboard:**
1. Go to your project settings
2. Navigate to **Environment Variables**
3. Add variables like:
   - `PYTHON_VERSION`: `3.12`
   - Any API keys or secrets

**Via CLI:**
```bash
vercel env add PYTHON_VERSION
```

---

## Verification Steps

After deployment, test these URLs:

1. **Frontend Dashboard**
   ```
   https://your-project-name.vercel.app/
   ```
   Should show the interactive flood monitoring dashboard

2. **API Documentation**
   ```
   https://your-project-name.vercel.app/docs
   ```
   Should show FastAPI Swagger UI

3. **API Endpoints**
   ```
   https://your-project-name.vercel.app/api/stations
   https://your-project-name.vercel.app/api/levels/latest
   https://your-project-name.vercel.app/api/alerts/summary
   ```
   Should return JSON data

---

## Automatic Deployments

Once connected to GitHub, Vercel will automatically deploy:
- **Production**: When you push to `main` or `master` branch
- **Preview**: When you push to any other branch (like `dev-rensith`)

To change the production branch:
1. Go to Project Settings
2. Navigate to **Git**
3. Change **Production Branch** to `dev-rensith`

---

## Custom Domain (Optional)

To add a custom domain:

1. Go to Project Settings → **Domains**
2. Click **Add Domain**
3. Enter your domain (e.g., `flood-monitor.lk`)
4. Follow DNS configuration instructions
5. Wait for DNS propagation (5-60 minutes)

---

## Troubleshooting

### Build Fails
- Check the build logs in Vercel dashboard
- Ensure `requirements.txt` has all dependencies
- Verify Python version compatibility

### API Returns 404
- Check `vercel.json` routes configuration
- Ensure API routes start with `/api/`
- Check FastAPI route prefixes in `app/main.py`

### Frontend Shows Blank Page
- Check browser console for errors
- Verify `index.html` is in the root directory
- Check that API calls use relative URLs

### CORS Errors
- CORS is already enabled in `app/main.py`
- If issues persist, check browser network tab
- Verify API base URL in `index.html`

---

## Performance Tips

1. **Enable Caching**: Vercel automatically caches static assets
2. **API Response Time**: First request may be slow (cold start), subsequent requests are faster
3. **Monitor Usage**: Free tier has generous limits but check your usage in Vercel dashboard

---

## Cost

**Vercel Free Tier includes:**
- Unlimited deployments
- 100GB bandwidth per month
- Serverless function execution
- Automatic HTTPS
- No credit card required

Perfect for this flood monitoring dashboard! 🎉

---

## Need Help?

- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Community](https://github.com/vercel/vercel/discussions)
- [FastAPI on Vercel Guide](https://vercel.com/docs/frameworks/python)

---

**Ready to deploy?** Just push your code to GitHub and import it to Vercel! 🚀
