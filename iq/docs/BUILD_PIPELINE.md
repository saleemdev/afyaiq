# AfyaIQ Build Pipeline Documentation

## Overview

The AfyaIQ frontend build pipeline is designed to seamlessly integrate with Frappe's build system, automatically building and deploying React assets during `bench migrate` and `bench build` commands.

## Build Architecture

The build pipeline consists of three key components:

1. **Frontend Build Script** (`iq/build.py`)
2. **Frappe Integration Layer** (`afyaiq/build.py`)
3. **Frappe Hooks** (`afyaiq/hooks.py`)

### 1. Frontend Build Script (iq/build.py)

Location: `/apps/afyaiq/iq/build.py`

**Purpose**: Handles the actual Vite build process and asset management.

**Functions**:
- `build()` - Main build orchestrator
- `extract_asset_hashes()` - Reads Vite manifest.json to get hashed filenames
- `update_html_template()` - Updates HTML template with correct asset references
- `replace_fallback_hash()` - Updates fallback hash variables

**Build Process**:
```python
[1/3] Running npm build...
  → Executes: npm run build
  → Output: /apps/afyaiq/afyaiq/public/iq/
  → Manifest: /apps/afyaiq/afyaiq/public/iq/.vite/manifest.json

[2/3] Extracting asset hashes...
  → Reads manifest.json
  → Extracts JS file: index-[hash].js
  → Extracts CSS file: index-[hash].css

[3/3] Updating HTML template...
  → Updates: /apps/afyaiq/afyaiq/www/afyaiq-ui.html
  → Replaces FALLBACK_JS and FALLBACK_CSS variables
  → Ensures CSRF token injection
```

### 2. Frappe Integration Layer (afyaiq/build.py)

Location: `/apps/afyaiq/afyaiq/build.py`

**Purpose**: Bridges Frappe's build system with the frontend build script.

**Functions**:
- `before_build()` - Called before Frappe build, triggers frontend build
- `after_build()` - Called after Frappe build, verifies assets
- `call_frontend_build_script()` - Executes iq/build.py
- `verify_build_assets()` - Ensures all assets exist and are referenced correctly
- `run_frontend_build()` - Migration hook handler

**Integration Points**:
- Hooks into Frappe's `build_hooks` system
- Handles both `bench build` and `bench migrate` scenarios
- Logs errors without failing the build/migration process

### 3. Frappe Hooks (afyaiq/hooks.py)

Location: `/apps/afyaiq/afyaiq/hooks.py`

**Configuration**:
```python
# Build hooks
build_hooks = {
    "before_build": "afyaiq.build.before_build",
    "after_build": "afyaiq.build.after_build"
}

# Migration hooks
after_migrate = [
    "afyaiq.build.run_frontend_build"
]
```

**Purpose**: Registers the build functions with Frappe's hook system.

## Vite Configuration

Location: `/apps/afyaiq/iq/vite.config.ts`

**Key Settings**:
```typescript
{
  base: '/assets/afyaiq/iq/',          // Asset base URL
  build: {
    outDir: '../afyaiq/public/iq',     // Output directory
    manifest: true,                     // Generate manifest.json
  },
  server: {
    port: 5173,                         // Dev server port
    proxy: {
      '/api': 'http://localhost:8000',  // Proxy API calls to Frappe
    }
  }
}
```

## Build Triggers

The frontend build is automatically triggered in three scenarios:

### 1. bench build

```bash
cd /home/erpuser/frappe-bench
bench build --app afyaiq
```

**Flow**:
1. Frappe calls `afyaiq.build.before_build()`
2. Executes `iq/build.py` via subprocess
3. npm runs Vite build
4. Assets output to `afyaiq/public/iq/`
5. HTML template updated with hashes
6. Frappe calls `afyaiq.build.after_build()`
7. Verifies all assets exist

### 2. bench migrate

```bash
cd /home/erpuser/frappe-bench
bench migrate
```

**Flow**:
1. Frappe runs database migrations
2. Frappe calls `afyaiq.build.run_frontend_build()`
3. Same build process as `bench build`
4. Ensures assets always match code after migrations

### 3. Manual Build

```bash
cd /home/erpuser/frappe-bench/apps/afyaiq/iq
python build.py
```

**Flow**:
- Directly executes frontend build script
- Useful for testing or manual deployments

## Asset Output Structure

After build, the following structure is created:

```
/apps/afyaiq/afyaiq/public/iq/
├── .vite/
│   └── manifest.json              # Vite manifest with asset hashes
├── assets/
│   ├── index-[hash].js            # Main JavaScript bundle
│   ├── index-[hash].css           # Main CSS bundle
│   └── [vendor-chunks].js         # Code-split vendor chunks
└── index.html                     # Build output HTML (not used)

/apps/afyaiq/afyaiq/www/
└── afyaiq-ui.html                 # Frappe-compatible HTML template
                                   # (Updated by build script with hashes)
```

## HTML Template System

The HTML template uses a fallback mechanism to handle asset hashing:

**Template Variables**:
```javascript
const FALLBACK_JS = 'index-B0yp3bM1.js';   // Updated by build script
const FALLBACK_CSS = 'index-BwEIo6un.css'; // Updated by build script
```

**Asset Loading**:
1. HTML initially references placeholder assets
2. JavaScript checks if FALLBACK_* variables are updated
3. If updated, dynamically loads correct versioned assets
4. Ensures cache-busting and correct asset loading

**CSRF Token Injection**:
```html
<script>window.csrf_token='{{ frappe.session.csrf_token }}'</script>
```

This ensures React app has access to Frappe's CSRF token for API calls.

## Development Workflow

### Development Mode

```bash
cd /home/erpuser/frappe-bench/apps/afyaiq/iq
npm run dev
```

- Starts Vite dev server on port 5173
- Hot Module Replacement (HMR) enabled
- Proxies API calls to Frappe backend (port 8000)
- No build required, instant updates

### Production Build

```bash
# Option 1: Via bench (recommended)
cd /home/erpuser/frappe-bench
bench build --app afyaiq

# Option 2: Manual
cd /home/erpuser/frappe-bench/apps/afyaiq/iq
npm run build
```

### Testing the Build

```bash
# Test frontend build only
cd /home/erpuser/frappe-bench/apps/afyaiq/iq
python build.py

# Test full Frappe integration
cd /home/erpuser/frappe-bench
bench build --app afyaiq --force
```

## Troubleshooting

### Build Fails

**Check**:
1. `node_modules` exists: `cd iq && npm install`
2. Output directory permissions: `chmod 755 afyaiq/public/iq`
3. Build script permissions: `chmod +x iq/build.py`

**Common Errors**:
- "npm: command not found" → Install Node.js
- "ModuleNotFoundError: frappe" → Ensure running from bench context
- "Manifest not found" → Build didn't complete, check npm errors

### Assets Not Loading

**Check**:
1. Manifest exists: `cat afyaiq/public/iq/.vite/manifest.json`
2. HTML template updated: `cat afyaiq/www/afyaiq-ui.html`
3. Assets exist: `ls afyaiq/public/iq/assets/`
4. FALLBACK_* variables updated in HTML

**Debug**:
```bash
# Rebuild with verbose output
cd iq
python build.py

# Check asset references
grep -E "(FALLBACK_JS|FALLBACK_CSS)" ../afyaiq/www/afyaiq-ui.html
```

### CSRF Token Missing

**Check**:
1. HTML template has CSRF script: `grep csrf_token afyaiq/www/afyaiq-ui.html`
2. Frappe session is valid
3. Browser console for errors

## Comparison with frappe_devsecops_dashboard

The AfyaIQ build pipeline is modeled after `frappe_devsecops_dashboard` with these differences:

| Aspect | frappe_devsecops_dashboard | afyaiq |
|--------|---------------------------|--------|
| Frontend Dir | `frontend/` | `iq/` |
| Output Dir | `public/frontend/` | `public/iq/` |
| HTML File | `devsecops-ui.html` | `afyaiq-ui.html` |
| Base URL | `/assets/frappe_devsecops_dashboard/frontend/` | `/assets/afyaiq/iq/` |
| Dev Port | 8080 | 5173 |

**Shared Pattern**:
- Same three-layer architecture
- Same build hooks (before_build, after_build, after_migrate)
- Same manifest.json parsing
- Same HTML template update mechanism

## Best Practices

1. **Always use bench build** for production deployments
2. **Commit built assets** if deploying without npm access
3. **Test after migrations** to ensure assets rebuilt
4. **Use dev mode** during development for faster iteration
5. **Check manifest.json** if assets fail to load

## Integration with Frappe

The built frontend is served by Frappe as a web page:

**URL Pattern**:
```
https://your-site.com/afyaiq-ui
```

**Frappe serves**:
- HTML from: `afyaiq/www/afyaiq-ui.html`
- Assets from: `afyaiq/public/iq/assets/`

**To access**:
1. Ensure app is installed: `bench --site <site> install-app afyaiq`
2. Build assets: `bench build --app afyaiq`
3. Navigate to: `https://<site>/afyaiq-ui`

## Continuous Integration

For CI/CD pipelines:

```yaml
# Example GitHub Actions
steps:
  - name: Install dependencies
    working-directory: apps/afyaiq/iq
    run: npm ci

  - name: Build frontend
    working-directory: apps/afyaiq/iq
    run: npm run build

  - name: Verify build
    working-directory: apps/afyaiq
    run: |
      test -f afyaiq/public/iq/.vite/manifest.json
      test -f afyaiq/www/afyaiq-ui.html
```

## Future Enhancements

Potential improvements to the build pipeline:

1. **Asset compression** - Gzip/Brotli compression
2. **Cache invalidation** - Automated cache clearing
3. **Build notifications** - Slack/email on build failures
4. **Asset preloading** - Link rel="preload" for critical assets
5. **Source maps** - Production source maps for debugging
6. **Bundle analysis** - webpack-bundle-analyzer equivalent

---

**Last Updated**: 2025-11-29
**Pipeline Version**: 1.0.0
**Compatible with**: Frappe 14+, Vite 5+, React 19
