# ResQ-Unified Deployment Guide

This guide covers production deployment of ResQ-Unified to Vercel (frontend) and Supabase Cloud (backend).

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Backend Setup (Supabase)](#backend-setup)
3. [Frontend Setup (Vercel)](#frontend-setup)
4. [Post-Deployment](#post-deployment)
5. [Monitoring](#monitoring)
6. [Troubleshooting](#troubleshooting)

---

## Prerequisites

- Supabase account (free or paid plan)
- Vercel account
- GitHub account with repository access
- Node.js 18+ installed locally
- Git CLI installed

---

## Backend Setup (Supabase)

### Step 1: Create Supabase Project

1. Go to https://supabase.com
2. Click "New Project"
3. Choose organization and project name
4. Select region closest to users (Asia-Singapore recommended for Sri Lanka)
5. Set a strong database password
6. Wait for project to initialize

### Step 2: Apply Database Migrations

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-id your-project-id

# Push migrations
supabase db push
```

### Step 3: Set Up Authentication

1. In Supabase dashboard, go to Authentication → Providers
2. Email provider is enabled by default
3. Configure email templates (optional but recommended):
   - Go to Email Templates
   - Customize confirmation, reset, and invite emails

### Step 4: Configure Storage

1. Go to Storage → Buckets
2. Create bucket: `documents`
3. Set policy to allow authenticated users:

```sql
CREATE POLICY "Allow authenticated uploads" ON storage.objects
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow users to read documents" ON storage.objects
  FOR SELECT
  USING (true);
```

### Step 5: Get API Keys

1. Go to Project Settings → API
2. Copy:
   - **Project URL**: `VITE_SUPABASE_URL`
   - **Anon Key**: `VITE_SUPABASE_ANON_KEY`
3. Keep these safe for next steps

### Step 6: Deploy Edge Functions

```bash
# Deploy document processing function
supabase functions deploy process-document

# Deploy SMS notification function
supabase functions deploy send-sms

# Deploy weather sync function
supabase functions deploy sync-weather
```

---

## Frontend Setup (Vercel)

### Step 1: Push Code to GitHub

```bash
# Initialize Git if not already done
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/your-org/resq-unified.git
git push -u origin main
```

### Step 2: Import Project to Vercel

1. Go to https://vercel.com
2. Click "Import Project"
3. Select GitHub and authorize
4. Find and select your resq-unified repository
5. Click "Import"

### Step 3: Add Environment Variables

In Vercel deployment settings:

```env
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_WEATHER_API_KEY=optional
VITE_OPENAI_API_KEY=optional
```

### Step 4: Configure Build Settings

- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

### Step 5: Deploy

1. Click "Deploy"
2. Wait for build to complete
3. Your app will be available at `your-project.vercel.app`

---

## Post-Deployment

### Step 1: Verify Installation

```bash
# Test Supabase connection
curl https://your-project.supabase.co/rest/v1/user_profiles \
  -H "apikey: your-supabase-anon-key"
```

### Step 2: Initialize Admin Accounts

1. Go to your deployed app
2. Sign up with first admin email
3. In Supabase dashboard, manually update user role to SUPER_ADMIN
4. Repeat for other admin accounts

Or use the setup script in dev environment:

```typescript
import { completeSetup } from '@/lib/setup';
await completeSetup();
```

### Step 3: Configure API Services

1. Log in as admin
2. Go to Admin Dashboard → API Configuration
3. Add API keys:
   - **Weather**: OpenWeatherMap or keep free tier
   - **SMS**: Twilio account (optional)
   - **Maps**: Google Maps (optional)

### Step 4: Test Core Features

- [ ] Create a test case
- [ ] Register a test volunteer
- [ ] Send a test alert
- [ ] Upload a test document
- [ ] Verify real-time updates

### Step 5: Set Up Monitoring

```bash
# Optional: Set up error tracking with Sentry
npm install @sentry/react @sentry/tracing
```

Configure in `main.tsx`:

```typescript
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "your-sentry-dsn",
  environment: "production"
});
```

---

## Custom Domain Setup

### Vercel Domain

1. In Vercel dashboard, go to Settings → Domains
2. Click "Add" and enter your domain
3. Add DNS records to your domain registrar
4. Vercel will provide exact records needed
5. Wait for DNS propagation (24-48 hours)

### SSL Certificate

Vercel automatically provisions free SSL certificates via Let's Encrypt.

---

## Database Backups

### Automatic Backups

Supabase provides:
- Free tier: Daily backups for 7 days
- Pro tier: Hourly backups for 14 days

### Manual Backup

```bash
# Export database
supabase db pull

# This creates a migrations file with current schema
```

### Restore from Backup

1. In Supabase dashboard
2. Go to Database → Backups
3. Select backup and click "Restore"
4. Confirm and wait for restore to complete

---

## Monitoring

### Supabase Dashboard

- Go to Analytics for API usage
- Monitor storage usage
- Check Edge Function logs
- Review Auth events

### Vercel Dashboard

- Monitor deployment status
- Check build logs
- View analytics and performance
- Set up error tracking

### Application Monitoring

Add to admin dashboard for:
- Active users count
- API response times
- Error rates
- Resource consumption

---

## Performance Optimization

### Database Optimization

```sql
-- Create indexes on frequently queried columns
CREATE INDEX idx_cases_status ON cases(status);
CREATE INDEX idx_cases_created_at ON cases(created_at DESC);
CREATE INDEX idx_beneficiaries_district ON beneficiaries(district);
```

### Frontend Optimization

1. Enable code splitting in Vite
2. Lazy load routes with React Router
3. Optimize images
4. Enable gzip compression (Vercel default)

### API Optimization

- Use database indexes (already configured)
- Implement query result caching
- Batch API calls when possible
- Use select statements to limit fields

---

## Scaling

### Database Scaling

Monitor in Supabase:
- Connection count
- Storage usage
- Query performance

Upgrade plan if:
- Connection limit approaching
- Storage > 90% full
- Query times increasing

### CDN & Caching

Vercel provides:
- Global CDN by default
- Automatic cache invalidation
- Edge functions for dynamic content

### Load Testing

```bash
# Example with Apache Bench
ab -n 1000 -c 10 https://your-app.vercel.app/
```

---

## Security Checklist

- [ ] Change all default admin passwords
- [ ] Enable 2FA for admin accounts (if supported)
- [ ] Configure RLS policies on sensitive tables
- [ ] Restrict API key access to required endpoints
- [ ] Enable HTTPS (Vercel default)
- [ ] Set up CORS policies
- [ ] Enable audit logging
- [ ] Regular security audits
- [ ] Keep dependencies updated

---

## Troubleshooting

### Build Fails

**Problem**: "Module not found" errors

**Solution**:
```bash
npm install
npm run build --verbose
```

### Deployment Fails

**Problem**: "Build script exited with status 1"

**Solution**:
1. Check Vercel build logs
2. Verify environment variables
3. Test locally: `npm run build`

### Database Connection Issues

**Problem**: "Cannot connect to database"

**Solution**:
1. Verify `VITE_SUPABASE_URL` is correct
2. Check `VITE_SUPABASE_ANON_KEY` is valid
3. Verify Supabase project is running
4. Check network connectivity

### Real-time Not Working

**Problem**: Changes not appearing in real-time

**Solution**:
1. Verify realtime enabled in Supabase
2. Check browser console for WebSocket errors
3. Restart the app
4. Check browser allows WebSockets

### Slow Performance

**Problem**: App loading slowly

**Solution**:
1. Check Vercel analytics
2. Profile frontend (DevTools)
3. Check database query times
4. Optimize images and bundles

---

## Support

- **Supabase Docs**: https://supabase.com/docs
- **Vercel Docs**: https://vercel.com/docs
- **GitHub Issues**: Report bugs and features
- **Community**: GitHub Discussions

---

## Next Steps

1. Set up CI/CD pipeline with GitHub Actions
2. Configure automated testing
3. Set up staging environment
4. Implement monitoring and alerts
5. Create runbooks for common issues

---

**Deployment Complete! 🎉**

Your ResQ-Unified instance is now live and ready to save lives!
