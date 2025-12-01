# AgentScope Frontend Completion Build Prompt

## Context

AgentScope is a full-stack AI agent debugging and testing platform. The **backend is 100% complete** with all APIs implemented, but the **frontend is incomplete**. Currently, the frontend has authentication pages (login/register) but lacks the core functionality to make the platform usable.

### Current State

**✅ Backend Complete:**
- FastAPI backend with PostgreSQL
- User authentication (JWT)
- Projects CRUD API
- API Keys management API
- Runs and Steps ingestion API
- All database models and schemas implemented

**❌ Frontend Incomplete:**
- No project management UI
- No API key management UI
- Dashboard shows static/hardcoded data
- Runs pages don't fetch real data
- No navigation/layout structure
- No project context/selection

### Technology Stack (Frontend)
- React 18 + TypeScript
- Vite build tool
- Tailwind CSS (dark mode already configured)
- Zustand for state management
- TanStack Query (React Query v5) for data fetching
- React Router v6
- Axios for API calls

## Goal

Complete the frontend to make AgentScope fully functional, allowing users to:
1. Create and manage projects
2. Generate and manage API keys
3. View real run data and statistics
4. Navigate between different sections
5. Inspect run details and steps

## Implementation Plan

### Phase 1: Core Infrastructure

#### 1.1 Create Layout Component

**File:** `frontend/src/components/Layout.tsx`

Create a layout with:
- Top navigation bar with user info and logout
- Sidebar navigation with links to:
  - Dashboard
  - Runs
  - Projects
  - API Keys
- Project selector dropdown in the top nav
- Dark mode already works via Tailwind config

**Key Features:**
- Use `useAuthStore` to get user info and logout function
- Use new `useProjectStore` (to be created) for selected project
- Responsive design (hamburger menu on mobile)
- Active route highlighting

#### 1.2 Create Project Store

**File:** `frontend/src/stores/projectStore.ts`

Create Zustand store for:
- Currently selected project
- List of user's projects
- Actions: `setSelectedProject`, `setProjects`
- Persist selected project ID to localStorage

**Example Structure:**
```typescript
interface ProjectState {
  selectedProject: Project | null
  projects: Project[]
  setSelectedProject: (project: Project | null) => void
  setProjects: (projects: Project[]) => void
}
```

#### 1.3 Update API Client

**File:** `frontend/src/api/client.ts`

Add API methods for:
- `getProjects()` - GET /api/projects
- `createProject(data)` - POST /api/projects
- `updateProject(id, data)` - PATCH /api/projects/{id}
- `deleteProject(id)` - DELETE /api/projects/{id}
- `getProjectStats(id)` - GET /api/projects/{id}/stats
- `getApiKeys(projectId)` - GET /api/projects/{projectId}/api-keys
- `createApiKey(projectId, data)` - POST /api/projects/{projectId}/api-keys
- `revokeApiKey(projectId, keyId)` - DELETE /api/projects/{projectId}/api-keys/{keyId}
- `getRuns(projectId, params?)` - GET /api/runs?project_id={projectId}
- `getRun(id)` - GET /api/runs/{id}

### Phase 2: Projects Management

#### 2.1 Create Projects Page

**File:** `frontend/src/pages/ProjectsPage.tsx`

Features:
- List all user's projects in cards/table
- "Create Project" button opens modal/form
- Each project shows:
  - Name, description
  - Created date
  - Total runs count
  - Edit/Delete buttons
- Use TanStack Query for data fetching
- Optimistic updates on create/delete

**UI Components to Create:**
- ProjectCard component
- CreateProjectModal component
- EditProjectModal component
- DeleteConfirmDialog component

#### 2.2 Add Route

Update `frontend/src/App.tsx` to add:
```typescript
<Route path="/projects" element={token ? <ProjectsPage /> : <Navigate to="/login" />} />
```

### Phase 3: API Keys Management

#### 3.1 Create API Keys Page

**File:** `frontend/src/pages/ApiKeysPage.tsx`

Features:
- Requires a selected project (show message if none selected)
- List API keys for selected project
- Show: name, prefix (e.g., "ask_abc123..."), created date, status
- "Create API Key" button
- Copy full key to clipboard (only shown once after creation)
- Revoke button with confirmation
- Warning banner: "API keys are shown only once. Save them securely."

**Important:** When creating a key, the response includes the full key. Show it in a modal with copy button, then only show prefix in list.

**UI Components:**
- ApiKeyCard component
- CreateApiKeyModal component
- CopyKeyModal (shows after creation)
- RevokeConfirmDialog component

#### 3.2 Add Route

```typescript
<Route path="/api-keys" element={token ? <ApiKeysPage /> : <Navigate to="/login" />} />
```

### Phase 4: Dashboard with Real Data

#### 4.1 Update Dashboard Page

**File:** `frontend/src/pages/DashboardPage.tsx`

Replace hardcoded zeros with real data:
- Fetch project stats using `getProjectStats(selectedProject.id)`
- Fetch recent runs using `getRuns(selectedProject.id, { limit: 10 })`
- Show "Select a project" message if no project selected
- Display metrics:
  - Total runs
  - Failed runs
  - Average latency (if available)
  - Test pass rate (if available)
- Recent runs table with:
  - Agent name
  - Status badge (completed/failed/running)
  - Started time
  - Duration
  - Link to run detail

Use TanStack Query with auto-refresh every 30 seconds for live updates.

### Phase 5: Runs Page with Real Data

#### 5.1 Update Runs Page

**File:** `frontend/src/pages/RunsPage.tsx`

Features:
- Fetch runs for selected project
- Filterable by status (all/completed/failed/running)
- Sortable by date, duration, status
- Pagination (20 per page)
- Each run shows:
  - External ID (if set) or Run ID
  - Agent name
  - Status badge
  - Start time
  - Duration
  - Step count
  - Click to view details
- Empty state if no runs

#### 5.2 Update Run Detail Page

**File:** `frontend/src/pages/RunDetailPage.tsx`

Features:
- Fetch run details with all steps
- Show run header:
  - Agent name
  - Status
  - Duration
  - Token usage (total)
  - Error (if failed)
- Timeline/list of steps:
  - Step index
  - Step type badge (llm_call, tool_call, reasoning, etc.)
  - Name
  - Duration
  - Tokens used
  - Expandable to show:
    - Input (formatted JSON)
    - Output (formatted JSON)
    - Error (if present)
    - Metadata
- Use syntax highlighting for JSON (can use `react-json-view` or simple `<pre>` tags)

### Phase 6: Navigation Integration

#### 6.1 Update App.tsx

Wrap all authenticated routes in the `Layout` component:

```typescript
function App() {
  const { token } = useAuthStore()

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={!token ? <LoginPage /> : <Navigate to="/dashboard" />} />
        <Route path="/register" element={!token ? <RegisterPage /> : <Navigate to="/dashboard" />} />
        
        {/* Authenticated routes with layout */}
        <Route element={token ? <Layout /> : <Navigate to="/login" />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/runs" element={<RunsPage />} />
          <Route path="/runs/:id" element={<RunDetailPage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/api-keys" element={<ApiKeysPage />} />
        </Route>
        
        <Route path="/" element={<Navigate to="/dashboard" />} />
      </Routes>
    </BrowserRouter>
  )
}
```

The `Layout` component should use `<Outlet />` to render child routes.

### Phase 7: User Experience Enhancements

#### 7.1 Project Auto-Selection

When user logs in:
1. Fetch all projects
2. If user has projects:
   - Check localStorage for last selected project
   - If exists and still valid, select it
   - Otherwise, select first project
3. If user has no projects:
   - Show onboarding screen suggesting to create first project
   - Redirect to projects page

#### 7.2 Loading & Error States

- Add loading spinners during data fetches
- Show error messages when API calls fail
- Add retry buttons for failed requests
- Use TanStack Query's built-in error/loading states

#### 7.3 Toast Notifications

Add toast notifications for:
- Project created/updated/deleted
- API key created/revoked
- Errors
- Success messages

Can use a simple toast library like `react-hot-toast` or `sonner`:
```bash
npm install react-hot-toast
```

## Implementation Guidelines

### Code Style

1. **TypeScript:** Use strict typing, avoid `any`
2. **Components:** Functional components with hooks
3. **State Management:** 
   - Zustand for global state (auth, project selection)
   - TanStack Query for server state
   - React state for local UI state
4. **Styling:** Tailwind CSS classes
5. **Error Handling:** Try-catch blocks, show user-friendly messages
6. **Accessibility:** ARIA labels, keyboard navigation

### Tailwind Classes Already Available

The dark theme is configured, use semantic classes:
- Backgrounds: `bg-background`, `bg-surface`
- Text: `text-text-primary`, `text-text-secondary`
- Borders: `border-border`
- Buttons: `btn-primary`, `btn-secondary`
- Cards: `card` class
- Status badges: `badge-success`, `badge-error`, `badge-warning`

### TanStack Query Setup

Already imported in the project. Use hooks like:
```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

// Fetch data
const { data, isLoading, error } = useQuery({
  queryKey: ['projects'],
  queryFn: api.getProjects
})

// Mutate data
const createProjectMutation = useMutation({
  mutationFn: api.createProject,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['projects'] })
  }
})
```

### API Response Types

Backend returns data in these formats:

**Projects:**
```typescript
interface Project {
  id: string
  user_id: string
  name: string
  description: string | null
  created_at: string
}

interface ProjectStats {
  total_runs: number
  failed_runs: number
  avg_latency_ms: number | null
  test_pass_rate: number | null
  recent_runs: number
}
```

**API Keys:**
```typescript
interface ApiKey {
  id: string
  project_id: string
  key_prefix: string
  name: string
  created_at: string
  revoked_at: string | null
}

interface ApiKeyCreateResponse {
  id: string
  project_id: string
  key: string  // ONLY in create response!
  key_prefix: string
  name: string
  created_at: string
}
```

**Runs:**
```typescript
interface Run {
  id: string
  project_id: string
  external_id: string | null
  agent_name: string
  status: 'running' | 'completed' | 'failed'
  input: object | null
  output: object | null
  meta_data: object | null
  error: object | null
  started_at: string
  ended_at: string | null
  created_at: string
}

interface RunStep {
  id: string
  run_id: string
  step_index: number
  step_type: string
  name: string
  input: object | null
  output: object | null
  meta_data: object | null
  error: object | null
  tokens_used: number | null
  latency_ms: number | null
  started_at: string | null
  ended_at: string | null
  created_at: string
}
```

## Testing Checklist

After implementation, verify:

### User Flow 1: New User
1. ✅ Register new account
2. ✅ Login successfully
3. ✅ See empty state / onboarding
4. ✅ Create first project
5. ✅ Project auto-selected
6. ✅ Navigate to API Keys
7. ✅ Create API key
8. ✅ Copy key to clipboard
9. ✅ See key prefix in list

### User Flow 2: With Data
1. ✅ Login with existing account
2. ✅ Last selected project loaded
3. ✅ Dashboard shows real stats
4. ✅ Navigate to Runs
5. ✅ See list of runs
6. ✅ Click run to view details
7. ✅ Expand steps to see input/output
8. ✅ Switch projects from dropdown
9. ✅ Data updates for new project

### User Flow 3: Management
1. ✅ Create new project
2. ✅ Edit project name/description
3. ✅ Delete project (with confirmation)
4. ✅ Create multiple API keys
5. ✅ Revoke API key
6. ✅ Logout and login again
7. ✅ Project selection persisted

## File Structure Summary

```
frontend/src/
├── components/
│   ├── Layout.tsx              # NEW: Main layout with nav
│   ├── ProjectSelector.tsx     # NEW: Dropdown for project selection
│   ├── Sidebar.tsx             # NEW: Navigation sidebar
│   ├── TopNav.tsx              # NEW: Top navigation bar
│   ├── ProjectCard.tsx         # NEW: Project list item
│   ├── ApiKeyCard.tsx          # NEW: API key list item
│   ├── RunCard.tsx             # NEW: Run list item
│   ├── RunTimeline.tsx         # NEW: Step timeline view
│   ├── StepDetail.tsx          # NEW: Expandable step details
│   └── modals/
│       ├── CreateProjectModal.tsx
│       ├── EditProjectModal.tsx
│       ├── CreateApiKeyModal.tsx
│       └── CopyKeyModal.tsx
├── pages/
│   ├── LoginPage.tsx           # EXISTS
│   ├── RegisterPage.tsx        # EXISTS
│   ├── DashboardPage.tsx       # UPDATE: Connect to real data
│   ├── ProjectsPage.tsx        # NEW: Projects management
│   ├── ApiKeysPage.tsx         # NEW: API keys management
│   ├── RunsPage.tsx            # UPDATE: Fetch real data
│   └── RunDetailPage.tsx       # UPDATE: Fetch real data
├── stores/
│   ├── authStore.ts            # EXISTS
│   └── projectStore.ts         # NEW: Project selection
├── api/
│   └── client.ts               # UPDATE: Add all API methods
└── types/
    └── index.ts                # UPDATE: Add all types
```

## Success Criteria

When complete, a user should be able to:
1. ✅ Create and manage multiple projects
2. ✅ Generate and copy API keys
3. ✅ See real-time dashboard statistics
4. ✅ Browse all runs for a project
5. ✅ View detailed step-by-step execution
6. ✅ Switch between projects seamlessly
7. ✅ Have a professional, polished UI
8. ✅ Experience smooth loading and error states

## Next Steps (After Frontend Complete)

Once the frontend is done, the platform will be ready for:
1. Python SDK creation
2. JavaScript SDK creation
3. Integration examples
4. Documentation
5. Real agent integration

## Notes for LLM Implementation

- Work incrementally: build and test each phase
- Use existing auth patterns from LoginPage/RegisterPage
- Follow the existing Tailwind styling patterns
- Backend APIs are all working - just need to call them
- Use TypeScript strictly - add proper types
- Add proper error handling and loading states
- Test each page before moving to the next
- Keep components small and focused
- Use React Query for all data fetching
- Remember: dark mode already configured, use semantic color classes

## Quick Start Command

To implement this, start with:
1. Create Layout component
2. Create projectStore
3. Update API client with all methods
4. Create ProjectsPage
5. Wire up navigation
6. Test and iterate

Good luck! 🚀
