# Troubleshooting Guide

## Common Issues and Solutions

### 1. "Blocked request. This host is not allowed" Error (DEPLOYMENT CRITICAL)

**Problem:**
```
Blocked request. This host ("your-app-name.emergent.host") is not allowed.
To allow this host, add "your-app-name.emergent.host" to `server.allowedHosts` in vite.config.js.
```

**Root Cause:**
Hardcoded specific domain names in the `allowedHosts` array prevent the application from working on different deployment domains.

**Solution:**
✅ **FIXED** - The `vite.config.ts` now uses wildcard patterns:

```typescript
server: {
  host: '0.0.0.0',
  port: 3000,
  allowedHosts: [
    '.emergent.host',              // ✅ Allows all *.emergent.host domains
    '.preview.emergentagent.com',  // ✅ Allows all preview domains
    'localhost',
    '127.0.0.1'
  ],
}
```

**Important**: Never add specific subdomains (e.g., `deployment-ready-6.preview.emergentagent.com`) as this will break deployment on different app names. Always use wildcard patterns (`.emergent.host`).

---

### 2. Missing Dependencies Error

**Problem:**
```
Error: The following dependencies are imported but could not be resolved
```

**Solution:**
Install missing dependencies:
```bash
cd /app
yarn install
```

If specific packages are missing:
```bash
yarn add <package-name>
```

---

### 3. Build Failures

**Problem:**
Build fails with errors about missing exports or modules.

**Solution:**
1. Clear cache and reinstall:
```bash
rm -rf node_modules/.vite
rm -rf node_modules
yarn install
```

2. Clear build directory:
```bash
rm -rf dist
yarn build
```

---

### 4. Icon Import Errors (lucide-react)

**Problem:**
```
"IconName" is not exported by "node_modules/lucide-react/dist/esm/lucide-react.js"
```

**Solution:**
Check if the icon exists in lucide-react:
```bash
node -e "const icons = require('lucide-react'); console.log('IconName' in icons);"
```

Replace with an available icon or use an alternative from the [Lucide Icons library](https://lucide.dev/icons/).

---

### 5. Path Alias Issues (@/* imports)

**Problem:**
```
Cannot find module '@/components/...'
```

**Solution:**
Ensure both `vite.config.ts` and `tsconfig.app.json` have path aliases configured:

**vite.config.ts:**
```typescript
resolve: {
  alias: {
    '@': path.resolve(__dirname, './src'),
  },
}
```

**tsconfig.app.json:**
```json
"compilerOptions": {
  "baseUrl": ".",
  "paths": {
    "@/*": ["./src/*"]
  }
}
```

---

### 6. Server Not Starting

**Problem:**
Application not accessible or server crashes.

**Solution:**
1. Check supervisor status:
```bash
sudo supervisorctl status vite-app
```

2. View error logs:
```bash
tail -n 50 /var/log/supervisor/vite-app.err.log
```

3. Restart server:
```bash
sudo supervisorctl restart vite-app
```

---

### 7. Environment Variables Not Working

**Problem:**
Supabase connection fails or environment variables are undefined.

**Solution:**
1. Create `.env` file from template:
```bash
cp .env.example .env
```

2. Add your credentials to `.env`:
```env
VITE_SUPABASE_URL=your_actual_url
VITE_SUPABASE_ANON_KEY=your_actual_key
```

3. **Important:** Environment variables MUST start with `VITE_` prefix to be exposed to the client in Vite.

4. Restart the server:
```bash
sudo supervisorctl restart vite-app
```

---

### 8. Hot Module Replacement (HMR) Issues

**Problem:**
Changes not reflecting in the browser.

**Solution:**
1. Clear Vite cache:
```bash
rm -rf node_modules/.vite
```

2. Hard refresh browser (Ctrl+Shift+R or Cmd+Shift+R)

3. Restart dev server:
```bash
sudo supervisorctl restart vite-app
```

---

### 9. CORS Errors

**Problem:**
CORS policy blocking requests to Supabase.

**Solution:**
1. Verify Supabase URL is correct (should include https://)
2. Check Supabase project settings allow your domain
3. Ensure using the correct Supabase client initialization

---

### 10. Production Build Issues

**Problem:**
Build succeeds but app doesn't work in production.

**Solution:**
1. Test production build locally:
```bash
yarn build
yarn preview
```

2. Check browser console for errors

3. Verify environment variables are set in Vercel dashboard

---

## Quick Commands Reference

```bash
# Check server status
sudo supervisorctl status

# Restart Vite server
sudo supervisorctl restart vite-app

# View logs
tail -f /var/log/supervisor/vite-app.out.log
tail -f /var/log/supervisor/vite-app.err.log

# Install dependencies
cd /app && yarn install

# Build for production
cd /app && yarn build

# Clear cache
rm -rf node_modules/.vite
rm -rf dist

# Check if package exists
yarn list | grep <package-name>
```

---

## Getting Help

If you encounter issues not covered here:

1. Check the [Vite documentation](https://vitejs.dev/guide/troubleshooting.html)
2. Review [React documentation](https://react.dev/)
3. Check [Supabase documentation](https://supabase.com/docs)
4. Search for error messages in [Stack Overflow](https://stackoverflow.com/)

---

**Last Updated:** January 2025
