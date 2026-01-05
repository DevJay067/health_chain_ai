# Vercel Deployment Guide for HealthChain

This guide will help you deploy your HealthChain application to Vercel.

## Prerequisites

1. A [Vercel account](https://vercel.com/signup) (free tier available)
2. Your Supabase credentials (URL and Anon Key)
3. Git repository (GitHub, GitLab, or Bitbucket)

## Environment Variables Setup

Before deploying, you need to set up your environment variables:

### Required Environment Variables

| Variable Name | Description | Where to Find |
|--------------|-------------|---------------|
| `VITE_SUPABASE_URL` | Your Supabase project URL | Supabase Dashboard > Settings > API > Project URL |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anonymous key | Supabase Dashboard > Settings > API > Project API keys > anon public |

## Deployment Methods

### Method 1: Deploy via Vercel Dashboard (Recommended)

1. **Push your code to Git**
   ```bash
   git add .
   git commit -m "Prepare for Vercel deployment"
   git push origin main
   ```

2. **Import your project to Vercel**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Click "Import Project"
   - Select your Git repository
   - Vercel will automatically detect the Vite framework

3. **Configure Environment Variables**
   - In the "Environment Variables" section, add:
     - `VITE_SUPABASE_URL` = your Supabase URL
     - `VITE_SUPABASE_ANON_KEY` = your Supabase anon key
   - Make sure to add these for all environments (Production, Preview, Development)

4. **Deploy**
   - Click "Deploy"
   - Wait for the build to complete (usually 1-2 minutes)
   - Your app will be live at `https://your-project-name.vercel.app`

### Method 2: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel
   ```

4. **Add Environment Variables**
   ```bash
   vercel env add VITE_SUPABASE_URL
   vercel env add VITE_SUPABASE_ANON_KEY
   ```

5. **Deploy to Production**
   ```bash
   vercel --prod
   ```

## Project Configuration

The following files have been configured for Vercel deployment:

### `vercel.json`
- **Build Configuration**: Uses `yarn build` to build the project
- **Output Directory**: Set to `dist` (Vite's default output)
- **Rewrites**: All routes redirect to `index.html` for SPA routing
- **Headers**: Optimized caching for static assets
- **Environment Variables**: References to Supabase credentials

### `.vercelignore`
- Excludes unnecessary files from deployment
- Keeps deployment size minimal
- Filters out local configuration and development files

## Post-Deployment

### 1. Verify Deployment
- Visit your deployed URL
- Check browser console for errors
- Test all features (First Aid, Health History, Analytics, Monitoring, Risk Prediction)

### 2. Set up Supabase
Make sure your Supabase database has the required tables:
- `health_records`
- `vital_signs`
- `health_insights`
- `connected_devices`
- `risk_assessments`

### 3. Configure Custom Domain (Optional)
- Go to your project settings in Vercel
- Navigate to "Domains"
- Add your custom domain
- Follow DNS configuration instructions

## Automatic Deployments

Vercel automatically deploys:
- **Production**: When you push to `main` branch
- **Preview**: When you create a pull request
- **Development**: Every commit on development branches

## Troubleshooting

### Build Failures
1. Check build logs in Vercel dashboard
2. Ensure all dependencies are in `package.json`
3. Verify environment variables are set correctly

### Runtime Errors
1. Check browser console for errors
2. Verify Supabase credentials are correct
3. Ensure Supabase tables are created
4. Check network tab for failed API requests

### Environment Variable Issues
- Environment variables must start with `VITE_` to be exposed to the client
- Add variables in Vercel dashboard under Settings > Environment Variables
- Redeploy after adding new environment variables

## Performance Optimization

The deployment is optimized with:
- ✅ Static asset caching (1 year)
- ✅ Gzip/Brotli compression (automatic)
- ✅ CDN distribution (global)
- ✅ Automatic HTTPS
- ✅ Image optimization (if using Vercel's Image component)

## Monitoring

- **Analytics**: Enable in Vercel dashboard > Analytics
- **Logs**: View real-time logs in Vercel dashboard > Deployments > [deployment] > Logs
- **Performance**: Check Web Vitals in Vercel dashboard

## Support

- [Vercel Documentation](https://vercel.com/docs)
- [Vite Documentation](https://vitejs.dev/)
- [Supabase Documentation](https://supabase.com/docs)

## Quick Commands Reference

```bash
# Local development
yarn dev

# Build for production
yarn build

# Preview production build
yarn preview

# Deploy to Vercel
vercel

# Deploy to production
vercel --prod

# Check deployment status
vercel ls
```

---

**Your HealthChain app is now ready for Vercel deployment! 🚀**
