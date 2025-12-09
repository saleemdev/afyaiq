# AfyaIQ React Frontend - Implementation Guide

## ✅ What's Been Completed

### 1. Dependencies Installed
- **React 19.2.0** with React-DOM
- **Ant Design 5.x** (UI component library)
- **Zustand 5.x** (state management)
- **React Router DOM 6.x** (routing)
- **Axios 1.x** (HTTP client)
- **Day.js** (date manipulation)
- **@ant-design/icons** (icon library)

### 2. Zustand Stores Created ✅
- **authStore.ts** - Complete with GitHub SSO, admin elevation, mock users
- **routeStore.ts** - Complete with CRUD operations, 8 mock routes (Standard/AI/Static types)
- **logsStore.ts** - Complete with real-time logs, 15 mock entries, stats calculation

### 3. Utilities & Services ✅
- **utils/constants.ts** - Route type configs, HTTP method colors, AI providers, security templates
- **services/api.ts** - Complete Axios setup with CSRF, auth interceptors, all API methods
- **components/common/VerifiedBadge.tsx** - Admin verification badge component

### 4. Directory Structure Created
```
src/
├── components/
│   ├── layout/           (needs: Sidebar, Header, MainLayout)
│   ├── common/          ✅ VerifiedBadge
│   ├── dashboard/       (needs: StatsCard, ActivityTable)
│   ├── routes/          (needs: RouteList, RouteEditor, configs)
│   ├── logs/            (needs: LogsViewer)
│   ├── security/        (needs: PolicyGrid, APIKeyManager)
│   └── profile/         (needs: ProfilePage)
├── store/               ✅ All stores complete
├── services/            ✅ API service complete
├── pages/               (needs: all page components)
└── utils/               ✅ Constants complete
```

## 🚧 What Needs to Be Built

### Priority 1: Layout Components (CRITICAL)
These are needed to get the app running:

1. **src/components/layout/MainLayout.tsx**
   - Ant Design Layout wrapper
   - Sidebar + Header + Content structure
   - Responsive mobile drawer

2. **src/components/layout/Sidebar.tsx**
   - Navigation menu with icons
   - Route highlighting
   - Collapse/expand functionality

3. **src/components/layout/Header.tsx**
   - User avatar with verified badge
   - Breadcrumbs
   - Primary action button ("New Route")

### Priority 2: Core Pages
4. **src/pages/Dashboard.tsx**
   - Stats cards (total routes by type, requests, tokens, avg response time)
   - Recent activity table
   - Uses routeStore and logsStore

5. **src/pages/Routes.tsx**
   - Route list with type filters
   - Search functionality
   - Navigate to route editor

6. **src/pages/Logs.tsx**
   - Real-time log table
   - AI-specific columns (tokens, model)
   - Filter by route/status/time

7. **src/pages/Security.tsx**
   - Security policy templates grid
   - API key manager

8. **src/pages/Profile.tsx**
   - User info
   - Admin application status
   - API key display

9. **src/pages/Documentation.tsx**
   - API documentation with code examples

### Priority 3: Route Management Components
10. **src/components/routes/RouteList.tsx**
    - Table of routes with type badges
    - Filter/search
    - Row actions (edit/delete)

11. **src/components/routes/RouteEditor.tsx**
    - Full-page form (not dialog)
    - Type-specific configuration
    - Approval workflow steps

12. **src/components/routes/StandardConfig.tsx**
    - Upstream URL
    - HTTP methods selector

13. **src/components/routes/AIModelConfig.tsx**
    - Provider selection
    - Model dropdown
    - Token limits, temperature sliders

14. **src/components/routes/SecurityConfig.tsx**
    - Rate limiting
    - CORS toggle
    - IP whitelist input

### Priority 4: App Configuration
15. **src/App.tsx**
    - React Router setup
    - MainLayout wrapper
    - Route definitions

16. **src/main.tsx**
    - Update to import Router
    - Ant Design ConfigProvider

17. **vite.config.ts**
    - Update base path for Frappe integration
    - Build to ../afyaiq/public/iq/

## 📋 Mock Data Summary

### Users (in authStore)
- Sarah Chen (Admin, verified)
- John Mwangi (Developer)
- Amara Okafor (Developer)

### Routes (in routeStore) - 8 total
1. `/api/v1/chat/completions` - AI Model (Anthropic Claude)
2. `/api/v1/patient/records` - Standard API
3. `/api/v1/ai/medical-imaging` - AI Model (OpenAI GPT-4 Vision)
4. `/api/v1/appointments` - Standard API (Pending status)
5. `/static/medical-forms` - Static Content
6. `/api/v1/ai/local-llama` - AI Model (Ollama, Draft)
7. `/api/v1/billing` - Standard API
8. `/static/patient-portal` - Static Content

### Logs (in logsStore) - 15 entries
- Mix of Standard/AI/Static route logs
- AI logs include tokens_used, model, provider fields
- Status codes: 200, 201, 404, 429, 500
- Response times: 23ms - 2456ms
- Token usage: 1560 - 3200 per AI request

## 🎨 Design System

### Colors (Already Configured)
- Primary: #2563eb (Blue)
- Success: #10b981 (Green)
- Warning: #f59e0b (Orange)
- Danger: #ef4444 (Red)
- AI Purple: #8b5cf6

### Route Type Icons & Colors
- ⚡ Standard API - #2563eb
- 🤖 AI Model - #8b5cf6
- 📁 Static Content - #10b981

### HTTP Method Colors
- GET: #10b981
- POST: #2563eb
- PUT: #f59e0b
- DELETE: #ef4444
- PATCH: #8b5cf6

## 🏗️ Architecture Principles

### Zustand-First State Management
```typescript
// ❌ DON'T DO THIS
const [routes, setRoutes] = useState([]);
useEffect(() => {
  fetchRoutes().then(setRoutes);
}, []);

// ✅ DO THIS
const routes = useRouteStore(state => state.routes);
const fetchRoutes = useRouteStore(state => state.fetchRoutes);
useEffect(() => {
  fetchRoutes(); // Store handles state update
}, []);
```

### Component Patterns
- **Presentational**: Receive data via props, no business logic
- **Container**: Subscribe to Zustand stores, pass data down
- **useEffect** only for: DOM operations, subscriptions, cleanup
- **NO useState** for: API data, business logic state

## 🔌 Frappe Integration Points

All API calls in `services/api.ts` are configured to work with Frappe backend:

```typescript
// Routes
GET  /api/method/afyaiq.api.routes.get_routes
POST /api/method/afyaiq.api.routes.create_route
PUT  /api/method/afyaiq.api.routes.update_route
DELETE /api/method/afyaiq.api.routes.delete_route

// Auth
POST /api/method/afyaiq.api.auth.github_login
POST /api/method/afyaiq.api.auth.apply_for_admin
GET  /api/method/frappe.auth.get_logged_user

// Logs
GET /api/method/afyaiq.api.logs.get_logs
GET /api/method/afyaiq.api.logs.get_stats

// Security
GET /api/method/afyaiq.api.security.get_api_keys
POST /api/method/afyaiq.api.security.generate_api_key
```

## 🚀 Next Steps

1. Create the layout components (MainLayout, Sidebar, Header)
2. Build the core pages (Dashboard, Routes, Logs)
3. Set up React Router in App.tsx
4. Configure Vite build for Frappe
5. Test the complete application

## 📚 Key Files Reference

- **Stores**: All state management logic
  - `store/authStore.ts` - User authentication & roles
  - `store/routeStore.ts` - Route CRUD & filtering
  - `store/logsStore.ts` - Logs & statistics

- **API Service**: `services/api.ts` - All backend integration

- **Constants**: `utils/constants.ts` - Colors, configs, templates

- **Components**: Build these next!
  - Layout: MainLayout, Sidebar, Header
  - Pages: Dashboard, Routes, Logs, Security, Profile
  - Route Management: RouteList, RouteEditor, type-specific configs

## 💡 Development Tips

1. **Start with layout**: MainLayout → Sidebar → Header
2. **Then Dashboard**: Simple page to verify routing works
3. **Then Routes page**: Most complex, handles all route types
4. **Use mock data**: All stores have realistic mock data
5. **Verified badges**: Use `<VerifiedBadge isVerified={user.is_verified_admin} />`
6. **Route type icons**: Use `ROUTE_TYPE_CONFIG[route.route_type].icon`
7. **Status colors**: Use `STATUS_COLORS[route.status]`

## 🎯 Critical Implementation Notes

### Route Editor Must Handle 3 Types:
1. **Standard API**: upstream_url, methods[]
2. **AI Model**: ai_config {provider, model, endpoint, max_tokens, temperature}
3. **Static**: static_path

### Admin Features:
- Show verified checkmark badge everywhere admins appear
- Developers can "Apply for Admin" button in Profile
- Admins can approve routes (status: Draft → Pending → Approved → Published)

### Real-time Logs:
- Use logsStore.subscribeToLogs() for WebSocket connection
- Show AI-specific columns only for AI route logs
- Filter by route path, status code range, time range

This implementation guide will help you or any developer complete the remaining components efficiently!
