# AfyaIQ - APISIX API Gateway Self-Service Portal

> **Documentation Location**: All project documentation is stored in `/docs/` directory
>
> - `docs/claude.md` - Main architecture and development guide (this file)
> - `docs/IMPLEMENTATION_GUIDE.md` - Step-by-step implementation checklist
> - Additional guides and specs should also go in `/docs/`

## Project Overview

AfyaIQ is a React-based self-service portal for managing APISIX API Gateway routes, with specialized support for AI model endpoints. Built with React 19, Ant Design 6, Zustand state management, and TypeScript.

### Key Features
- **Unified Route Management**: Standard APIs, AI Models, and Static Content
- **AI Model Integration**: Anthropic, OpenAI, Ollama, and Local models
- **Role-Based Access**: Developer (Website User) vs Admin (System User)
- **Real-time Monitoring**: WebSocket-based log streaming
- **GitHub SSO**: Authentication via GitHub
- **Admin Elevation**: Developers can apply for admin access
- **API Testing**: Interactive testing with curl examples

## Technology Stack

- **React 19.2.0** - Latest React with modern hooks
- **TypeScript** - Type-safe development
- **Ant Design 5.x** - Enterprise UI component library
- **Zustand 5.x** - Lightweight state management
- **React Router 6.x** - Client-side routing
- **Axios 1.x** - HTTP client with interceptors
- **Vite** - Fast build tool and dev server

## Architecture Philosophy

### Zustand-First State Management

**WHY**: Traditional React patterns lead to scattered state, excessive re-renders, and complex prop drilling. Zustand provides:
- Centralized state management
- No boilerplate (compared to Redux)
- Direct store access without Context
- Better performance (selective re-renders)
- Easier testing

**PATTERN**: Components should be primarily presentational

```typescript
// ❌ ANTI-PATTERN - Local state for API data
function RoutesList() {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchRoutes()
      .then(data => setRoutes(data))
      .finally(() => setLoading(false));
  }, []);

  return <Table dataSource={routes} loading={loading} />;
}

// ✅ CORRECT PATTERN - Zustand store handles all state
function RoutesList() {
  const routes = useRouteStore(state => state.routes);
  const loading = useRouteStore(state => state.isLoading);
  const fetchRoutes = useRouteStore(state => state.fetchRoutes);

  useEffect(() => {
    fetchRoutes(); // Store manages state internally
  }, [fetchRoutes]);

  return <Table dataSource={routes} loading={loading} />;
}
```

### Component Architecture

#### Presentational Components
- Receive data via props
- No business logic
- No API calls
- No complex state
- Reusable and testable

Example:
```typescript
interface StatsCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  trend?: number;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title, value, icon, trend
}) => (
  <Card>
    <Statistic
      title={title}
      value={value}
      prefix={icon}
      suffix={trend && <Badge count={`${trend}%`} />}
    />
  </Card>
);
```

#### Container Components
- Subscribe to Zustand stores
- Handle user interactions
- Call store actions
- Pass data to presentational components

Example:
```typescript
export const Dashboard: React.FC = () => {
  const stats = useLogsStore(state => state.stats);
  const routes = useRouteStore(state => state.routes);
  const fetchLogs = useLogsStore(state => state.fetchLogs);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  return (
    <div>
      <StatsCard
        title="Total Routes"
        value={routes.length}
        icon={<ApiOutlined />}
      />
      <StatsCard
        title="Total Requests (24h)"
        value={stats.totalRequests}
        icon={<LineChartOutlined />}
      />
    </div>
  );
};
```

### When to Use useState and useEffect

**useState** - Only for UI-specific ephemeral state:
- Form input values (before submission)
- Modal/drawer visibility
- Accordion expand/collapse
- Tab active keys
- Hover states, focus states

**useEffect** - Only for side effects outside React:
- DOM manipulation (focus, scroll)
- Setting up subscriptions (WebSockets)
- Cleanup operations
- Triggering store actions on mount

**NEVER** use useState/useEffect for:
- API response data
- Derived state (use selectors instead)
- Business logic state
- Global application state

## Zustand Stores

### authStore.ts
Handles user authentication, roles, and admin elevation.

**State**:
```typescript
{
  user: User | null,
  isAuthenticated: boolean,
  isLoading: boolean
}
```

**Actions**:
- `login(githubToken)` - Authenticate via GitHub SSO
- `logout()` - Clear user session
- `applyForAdmin()` - Submit admin elevation request
- `fetchUser()` - Get current user info

**Mock Data**: 3 users (1 admin with `is_verified_admin: true`, 2 developers)

### routeStore.ts
Manages API routes (Standard, AI Model, Static types).

**State**:
```typescript
{
  routes: Route[],
  selectedRoute: Route | null,
  filters: { type, status, search },
  isLoading: boolean
}
```

**Actions**:
- `fetchRoutes()` - Load all routes
- `createRoute(data)` - Create new route
- `updateRoute(id, data)` - Update existing route
- `deleteRoute(id)` - Remove route
- `setFilter(key, value)` - Update filter
- `selectRoute(id)` - Set selected route for editing
- `getFilteredRoutes()` - Get routes matching current filters

**Mock Data**: 8 routes
- 3 AI Model routes (Anthropic Claude, OpenAI GPT-4 Vision, Ollama Llama)
- 3 Standard API routes (Patient Records, Appointments, Billing)
- 2 Static Content routes (Medical Forms, Patient Portal)

### logsStore.ts
Handles HTTP request logs and statistics.

**State**:
```typescript
{
  logs: LogEntry[],
  filters: { route, status, timeRange },
  stats: { totalRequests, avgResponseTime, tokensUsed, errorRate },
  isLoading: boolean
}
```

**Actions**:
- `fetchLogs()` - Load log entries
- `subscribeToLogs()` - Set up real-time log stream (WebSocket)
- `setFilter(key, value)` - Update filter
- `getFilteredLogs()` - Get logs matching current filters

**Mock Data**: 15 log entries with AI-specific fields for AI routes

## Route Type System

### Standard API Route
```typescript
{
  route_type: 'standard',
  upstream_url: string,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  security: { ... },
  requests_24h: number,
  avg_response_time: number
}
```

### AI Model Route
```typescript
{
  route_type: 'ai_model',
  ai_config: {
    provider: 'anthropic' | 'openai' | 'ollama' | 'local',
    model: string,
    endpoint: string,
    max_tokens: number,
    temperature: number,
    prompt_template?: string
  },
  security: {
    rate_limit: {
      requests_per_minute: number,
      tokens_per_minute: number  // AI-specific
    }
  },
  tokens_used_24h: number,  // AI-specific metric
  requests_24h: number,
  avg_response_time: number
}
```

### Static Content Route
```typescript
{
  route_type: 'static',
  static_path: string,
  security: { ... },
  requests_24h: number,
  avg_response_time: number
}
```

## User Roles & Permissions

### Developer (Website User)
- Create routes (status: Draft)
- View own routes
- Test own routes
- Apply for admin elevation
- View own API keys

### Admin (System User with Role Profile)
- All developer permissions
- Approve/reject routes (Draft → Pending → Approved → Published)
- View all routes and logs
- Manage security policies
- Approve admin elevation requests
- **Verified badge (✓)** displayed next to name throughout UI

### Admin Elevation Workflow
1. Developer clicks "Apply for Admin" in Profile page
2. Backend creates Admin Application record
3. Existing admin reviews application
4. Admin approves/rejects
5. If approved, user's role changes to "admin" and `is_verified_admin` set to `true`

## UI Design System

### Color Palette
- **Primary**: #2563eb (Blue) - Primary actions, links
- **Success**: #10b981 (Green) - Success states, GET method
- **Warning**: #f59e0b (Orange) - Warnings, PUT method
- **Danger**: #ef4444 (Red) - Errors, DELETE method
- **AI Purple**: #8b5cf6 - AI model routes, PATCH method
- **Gray**: #6b7280 - Disabled states, neutral

### Route Type Styling
```typescript
const ROUTE_TYPE_CONFIG = {
  standard: { icon: '⚡', color: '#2563eb', label: 'Standard API' },
  ai_model: { icon: '🤖', color: '#8b5cf6', label: 'AI Model' },
  static: { icon: '📁', color: '#10b981', label: 'Static Content' }
};
```

### HTTP Method Badges
- GET → Green (#10b981)
- POST → Blue (#2563eb)
- PUT → Orange (#f59e0b)
- DELETE → Red (#ef4444)
- PATCH → Purple (#8b5cf6)

### Status Badges
- Draft → Gray (#6b7280)
- Pending → Orange (#f59e0b)
- Approved → Green (#10b981)
- Published → Blue (#2563eb)

### Verified Admin Badge
```tsx
import { CheckCircleFilled } from '@ant-design/icons';

<span>
  {user.name}
  {user.is_verified_admin && (
    <CheckCircleFilled style={{ color: '#2563eb', marginLeft: 4 }} />
  )}
</span>
```

## Component Structure

### Layout Components
**MainLayout.tsx** - Overall app structure
```tsx
<Layout>
  <Sidebar />
  <Layout>
    <Header />
    <Content>
      <Outlet /> {/* React Router renders pages here */}
    </Content>
  </Layout>
</Layout>
```

**Sidebar.tsx** - Navigation menu
- Dashboard
- Routes
- Logs
- Security
- Documentation
- Profile

**Header.tsx** - Top bar
- Breadcrumbs
- User avatar with verified badge
- Primary action button ("New Route")

### Page Components
**Dashboard.tsx**
- Stats grid (4 cards): Total Routes, Total Requests, Avg Response Time, Tokens Used
- Recent Activity table (latest logs)
- Route breakdown by type (pie chart or stats)

**Routes.tsx**
- Search bar
- Filters: Type (Standard/AI/Static/All), Status (Draft/Pending/Approved/Published/All)
- Routes table with columns:
  - Route Path
  - Type (badge with icon)
  - Created By (name + verified badge if admin)
  - Status (badge)
  - Requests (24h)
  - Avg Response Time
  - Actions (View, Edit, Test, Delete)

**Logs.tsx**
- Time range filter
- Route filter (dropdown of all route paths)
- Status filter (2xx, 4xx, 5xx)
- Logs table with columns:
  - Timestamp
  - Route Path
  - Type
  - Method (badge)
  - Status Code
  - Response Time
  - Tokens Used (AI routes only)
  - Model (AI routes only)
  - Client IP
  - Error Message (if applicable)

**Security.tsx**
- Security Policy Templates (cards grid)
- API Key Manager (table with generate/revoke actions)

**Profile.tsx**
- User information card
- API key display with copy button
- Admin application status (if developer)
- "Apply for Admin" button (if developer and not already applied)

**Documentation.tsx**
- API documentation sections
- Code examples (curl, Python, JavaScript)
- Interactive testing sandbox

### Route Management Components
**RouteEditor.tsx** - Full-page form (not modal/dialog)
- Route path input
- Route type selector (changes form fields)
- Conditional rendering based on type:
  - Standard → StandardConfig
  - AI Model → AIModelConfig
  - Static → Static path input
- SecurityConfig (all types)
- Approval workflow Steps component
- Test panel (bottom drawer or collapsible section)

**StandardConfig.tsx**
- Upstream URL input
- HTTP methods multi-select (GET, POST, PUT, DELETE, PATCH)

**AIModelConfig.tsx**
- Provider select (Anthropic, OpenAI, Ollama, Local)
- Model select (dynamic based on provider)
- Endpoint URL input
- Max Tokens slider (0-10000)
- Temperature slider (0-2, step 0.1)
- Prompt Template textarea (optional)

**SecurityConfig.tsx**
- Authentication required toggle
- Rate limit inputs:
  - Requests per minute
  - Tokens per minute (show only if AI route type)
- CORS enabled toggle
- IP Whitelist (tag input for CIDR ranges)

### Dashboard Components
**StatsCard.tsx** - Reusable stat display
```tsx
interface StatsCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  trend?: number;
  suffix?: string;
}
```

**ActivityTable.tsx** - Recent logs table
- Shows last 10 log entries
- Columns: Timestamp, Route, Status, Response Time
- "View All Logs" button → navigates to Logs page

### Security Components
**PolicyGrid.tsx** - Security policy templates
- Card grid of predefined templates
- Click to apply template to current route

**APIKeyManager.tsx** - API key CRUD
- Table of API keys with:
  - Key preview (masked, click to reveal)
  - Created date
  - Last used date
  - Actions (Copy, Revoke)
- "Generate New Key" button

## Frappe Backend Integration

### API Endpoints
All endpoints in `services/api.ts`:

**Authentication**:
- `POST /api/method/afyaiq.api.auth.github_login`
- `POST /api/method/frappe.auth.logout`
- `GET /api/method/frappe.auth.get_logged_user`
- `POST /api/method/afyaiq.api.auth.apply_for_admin`

**Routes**:
- `GET /api/method/afyaiq.api.routes.get_routes`
- `GET /api/method/afyaiq.api.routes.get_route?id={id}`
- `POST /api/method/afyaiq.api.routes.create_route`
- `PUT /api/method/afyaiq.api.routes.update_route`
- `DELETE /api/method/afyaiq.api.routes.delete_route?id={id}`
- `POST /api/method/afyaiq.api.routes.test_route`

**Logs**:
- `GET /api/method/afyaiq.api.logs.get_logs`
- `GET /api/method/afyaiq.api.logs.get_stats?time_range={range}`

**Security**:
- `GET /api/method/afyaiq.api.security.get_policies`
- `POST /api/method/afyaiq.api.security.create_policy`
- `GET /api/method/afyaiq.api.security.get_api_keys`
- `POST /api/method/afyaiq.api.security.generate_api_key`
- `POST /api/method/afyaiq.api.security.revoke_api_key`

**Admin**:
- `GET /api/method/afyaiq.api.admin.get_applications`
- `POST /api/method/afyaiq.api.admin.approve_application`
- `POST /api/method/afyaiq.api.admin.reject_application`

### Axios Configuration
```typescript
// Base setup in services/api.ts
const apiClient = axios.create({
  baseURL: window.location.origin,
  timeout: 30000
});

// Request interceptor - add CSRF token
apiClient.interceptors.request.use(config => {
  config.headers['X-Frappe-CSRF-Token'] = window.csrf_token;
  const token = localStorage.getItem('afyaiq_token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor - handle errors
apiClient.interceptors.response.use(
  response => response.data,
  error => {
    if (error.response?.status === 401) {
      // Redirect to login
    }
    return Promise.reject(error);
  }
);
```

## Build & Deployment

### Vite Configuration
Update `vite.config.ts` to match frappe_devsecops_dashboard pattern:

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  base: '/assets/afyaiq/iq/',
  build: {
    outDir: '../afyaiq/public/iq',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          antd: ['antd', '@ant-design/icons'],
          store: ['zustand']
        }
      }
    }
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true
      }
    }
  }
});
```

### Build Commands
```bash
# Development
npm run dev  # Start dev server on port 5173

# Production build
npm run build  # Builds to afyaiq/public/iq/

# Frappe integration
cd /home/erpuser/frappe-bench
bench build --app afyaiq  # Builds all frontend assets
```

### Frappe Integration Steps
1. Build React app: `npm run build` in `/apps/afyaiq/iq`
2. Output goes to: `/apps/afyaiq/afyaiq/public/iq/`
3. Frappe serves from: `/assets/afyaiq/iq/`
4. Create Frappe Web Page or use hooks.py to serve SPA

## Development Workflow

### 1. Start Development Server
```bash
cd /home/erpuser/frappe-bench/apps/afyaiq/iq
npm run dev
```

### 2. Create New Component
- Choose appropriate directory (layout, common, pages, routes, etc.)
- Use TypeScript
- Import from Zustand stores, not useState for data
- Use Ant Design components

### 3. Add New Route (React Router)
```typescript
// In App.tsx
<Route path="/new-page" element={<NewPage />} />
```

### 4. Add New Store Action
```typescript
// In relevant store (e.g., routeStore.ts)
export const useRouteStore = create<RouteState>((set, get) => ({
  // ... existing state and actions

  newAction: async (param: string) => {
    set({ isLoading: true });
    try {
      const result = await api.routes.newEndpoint(param);
      set(state => ({
        // update state based on result
        isLoading: false
      }));
    } catch (error) {
      console.error('Action failed:', error);
      set({ isLoading: false });
      throw error;
    }
  }
}));
```

### 5. Test Changes
- Use browser DevTools
- Check Zustand state in React DevTools (install extension)
- Monitor network requests for API calls
- Test responsive design (mobile, tablet, desktop)

## Mock Data Details

### Routes
8 diverse routes covering all types and statuses:
1. AI Model (Anthropic Claude) - Published, 1247 req/24h, 438k tokens
2. Standard API (Patient Records) - Published, 3456 req/24h
3. AI Model (OpenAI GPT-4 Vision) - Approved, 567 req/24h, 125k tokens
4. Standard API (Appointments) - Pending, 0 req/24h
5. Static (Medical Forms) - Published, 892 req/24h
6. AI Model (Ollama Llama) - Draft, 0 req/24h
7. Standard API (Billing) - Published, 2134 req/24h
8. Static (Patient Portal) - Published, 4567 req/24h

### Users
- **Sarah Chen** (Admin, verified) - Created routes 1, 3, 7
- **John Mwangi** (Developer) - Created routes 2, 5, 8
- **Amara Okafor** (Developer) - Created routes 4, 6

### Logs
15 log entries spanning:
- All 3 route types
- Success (2xx) and error (4xx, 5xx) responses
- AI logs with tokens_used, model, provider fields
- Various user agents (browser, mobile, curl, Postman)
- Response times from 23ms to 2456ms

## Testing Strategy

### Unit Tests
- Test Zustand stores in isolation
- Test presentational components with mock props
- Test utility functions

### Integration Tests
- Test store actions with mock API responses
- Test component + store interaction
- Test routing navigation

### E2E Tests (Future)
- Test full user workflows
- Test route creation flow
- Test admin approval workflow

## Security Considerations

### Frontend Security
- Never store sensitive data in localStorage
- Use HTTP-only cookies for auth tokens (Frappe handles this)
- Validate all user input before API submission
- Sanitize displayed data to prevent XSS
- Use CSRF tokens for all mutations

### API Key Handling
- Display API keys masked by default
- Require confirmation before revealing full key
- Only show full key once after generation
- Allow users to revoke keys immediately

### Role-Based UI
```typescript
const user = useAuthStore(state => state.user);

// Conditionally render admin features
{user?.role === 'admin' && (
  <Button onClick={handleApproveRoute}>Approve Route</Button>
)}

// Show verified badge
{user?.is_verified_admin && <VerifiedBadge />}
```

## Performance Optimization

### Code Splitting
Vite automatically splits chunks. Consider lazy loading routes:
```typescript
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Routes = lazy(() => import('./pages/Routes'));
```

### Zustand Selectors
Use specific selectors to prevent unnecessary re-renders:
```typescript
// ❌ Re-renders on any store change
const store = useRouteStore();

// ✅ Only re-renders when routes change
const routes = useRouteStore(state => state.routes);
```

### Memoization
Use React.memo for expensive presentational components:
```typescript
export const RouteCard = React.memo<RouteCardProps>(({ route }) => {
  // Expensive rendering logic
});
```

## Future Enhancements

1. **GraphQL Support** - Add route type for GraphQL APIs
2. **Advanced Analytics** - Time-series charts for requests/tokens
3. **Cost Tracking** - AI provider cost calculation
4. **Alerts** - Configure alerts for rate limits, errors
5. **Webhooks** - Trigger webhooks on route events
6. **Plugin System** - Custom route processors
7. **Batch Operations** - Bulk approve, delete, test routes
8. **API Versioning** - Support for API version management
9. **Load Balancing** - Multi-upstream configuration
10. **Caching Policies** - Configure response caching per route

## Troubleshooting

### Build Issues
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Check Node version: Should be ≥18.x
- Verify Vite config paths are correct

### State Not Updating
- Check if you're using store actions correctly
- Verify Zustand subscriptions are set up
- Check browser console for errors

### API Calls Failing
- Verify backend is running: `bench start`
- Check CSRF token is being sent
- Inspect network tab for error details
- Verify API endpoint paths match backend

### Routing Issues
- Ensure React Router is wrapped around app
- Check route paths don't have conflicts
- Verify base path in Vite config matches deployment

## Code Style Guidelines

### TypeScript
- Always define interfaces for props and state
- Use strict mode
- Avoid `any` type
- Use enums for fixed value sets

### Component Files
- One component per file
- Named exports for components
- Co-locate styles if component-specific
- File name matches component name

### State Management
- All API calls in Zustand actions
- No business logic in components
- Use selectors for derived state
- Keep stores focused (single responsibility)

### Imports Order
1. React imports
2. Third-party libraries
3. Ant Design components
4. Local components
5. Stores
6. Utils/constants
7. Types
8. Styles

## Contributing

This is an internal project. When adding features:
1. Follow the Zustand-first pattern
2. Match existing UI/UX patterns
3. Add TypeScript types
4. Test with mock data before backend integration
5. Document complex logic
6. Update this claude.md if architecture changes

## Project File Structure

```plaintext
/home/erpuser/frappe-bench/apps/afyaiq/iq/
├── docs/                          # 📚 All documentation (markdown files)
│   ├── claude.md                  # Main architecture guide
│   └── IMPLEMENTATION_GUIDE.md    # Step-by-step implementation tasks
├── src/
│   ├── components/
│   │   ├── layout/                # MainLayout, Sidebar, Header
│   │   ├── common/                # VerifiedBadge, reusable components
│   │   ├── dashboard/             # StatsCard, ActivityTable
│   │   ├── routes/                # RouteList, RouteEditor, configs
│   │   ├── logs/                  # LogsViewer
│   │   ├── security/              # PolicyGrid, APIKeyManager
│   │   └── profile/               # ProfilePage
│   ├── store/                     # ✅ Zustand stores (complete)
│   │   ├── authStore.ts
│   │   ├── routeStore.ts
│   │   └── logsStore.ts
│   ├── services/                  # ✅ API integration (complete)
│   │   └── api.ts
│   ├── utils/                     # ✅ Constants and helpers (complete)
│   │   └── constants.ts
│   ├── pages/                     # Page components
│   ├── App.tsx                    # React Router setup
│   └── main.tsx                   # Entry point
├── public/                        # Static assets
├── vite.config.ts                 # Build configuration
├── package.json                   # Dependencies
└── README.md                      # Project overview

✅ = Complete
🚧 = In progress
📝 = Not started
```

## Documentation Guidelines

### Where to Add New Documentation

All markdown files should be stored in the `/docs/` directory:

- **Architecture changes**: Update `docs/claude.md`
- **API documentation**: Create `docs/API.md`
- **Deployment guides**: Create `docs/DEPLOYMENT.md`
- **Component specifications**: Create `docs/COMPONENTS.md`
- **Testing documentation**: Create `docs/TESTING.md`

### Keeping Documentation Up-to-Date

When you make significant changes:

1. Update `docs/claude.md` if architecture patterns change
2. Update `docs/IMPLEMENTATION_GUIDE.md` if adding new tasks
3. Add new documentation files in `/docs/` for new features
4. Keep the file structure section above current

## Contact & Support

For questions about this codebase:

- Review `docs/claude.md` - Main architecture guide (this file)
- Check `docs/IMPLEMENTATION_GUIDE.md` - Remaining implementation tasks
- Inspect existing stores for patterns
- Refer to Ant Design docs: <https://ant.design/>

---

**Last Updated**: 2025-11-29
**Version**: 1.0.0
**React**: 19.2.0
**Ant Design**: 6.0.0
**Zustand**: 5.0.8
**React Router**: 7.9.6
