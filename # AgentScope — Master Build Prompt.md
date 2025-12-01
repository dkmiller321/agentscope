# AgentScope — Master Build Prompt

# BUILD PROMPT: AgentScope — AI Agent Debugger & Testing Platform

You are building a **production-grade, full-stack SaaS application** called **AgentScope**. This platform enables developers to debug, inspect, replay, and test AI agents. Follow ALL instructions precisely.

---

## 📋 APPLICATION OVERVIEW

AgentScope provides:
- **Run Ingestion**: SDK sends agent run data via API
- **Timeline Visualization**: Step-by-step execution viewer
- **Step Inspector**: Deep inspection of inputs, outputs, tool calls, errors
- **Replay Controls**: Re-run agent executions from any step
- **Test Suite**: Define tests, run them against agents, view results
- **Breakpoints**: Conditional pause points in agent execution
- **MCP Tool Inspector**: View Model Context Protocol tool definitions, calls, and errors
- **Project Management**: Multiple projects with separate API keys
- **Dashboard**: Overview of runs, errors, test health

---

## 🛠 TECHNOLOGY STACK (MANDATORY — DO NOT DEVIATE)

### Frontend
- **Framework**: React 18+ with Vite (TypeScript)
- **Styling**: Tailwind CSS with dark mode as default
- **State Management**: Zustand or React Query (TanStack Query v5)
- **Routing**: React Router v6
- **Environment Variable**: `VITE_API_BASE_URL` (points to backend)
- **Icons**: Lucide React
- **Charts**: Recharts (for dashboard metrics)
- **Code Display**: Monaco Editor or react-syntax-highlighter
- **Date Handling**: date-fns

### Backend
- **Framework**: FastAPI (Python 3.11+)
- **ORM**: SQLAlchemy 2.x with async support
- **Migrations**: Alembic
- **Database**: PostgreSQL (Neon-compatible)
- **Async Driver**: asyncpg
- **Validation**: Pydantic v2
- **Auth**: JWT tokens for dashboard, API keys for SDK ingestion
- **Password Hashing**: passlib with bcrypt

### Deployment Targets
- Frontend: Vercel (static build)
- Backend: Railway / Fly.io / Render (Dockerfile provided)

---

## 🗄 DATABASE SCHEMA

Create these tables with SQLAlchemy models and Alembic migrations:

### Table: `users`
```sql
id: UUID PRIMARY KEY DEFAULT gen_random_uuid()
email: VARCHAR(255) UNIQUE NOT NULL
password_hash: VARCHAR(255) NOT NULL
name: VARCHAR(255)
created_at: TIMESTAMP DEFAULT NOW()
updated_at: TIMESTAMP DEFAULT NOW()
```

### Table: `projects`
```sql
id: UUID PRIMARY KEY DEFAULT gen_random_uuid()
user_id: UUID REFERENCES users(id) ON DELETE CASCADE
name: VARCHAR(255) NOT NULL
description: TEXT
created_at: TIMESTAMP DEFAULT NOW()
updated_at: TIMESTAMP DEFAULT NOW()
```

### Table: `api_keys`
```sql
id: UUID PRIMARY KEY DEFAULT gen_random_uuid()
project_id: UUID REFERENCES projects(id) ON DELETE CASCADE
key_hash: VARCHAR(255) NOT NULL
key_prefix: VARCHAR(12) NOT NULL -- First 8 chars for display
name: VARCHAR(255)
last_used_at: TIMESTAMP
created_at: TIMESTAMP DEFAULT NOW()
revoked_at: TIMESTAMP
```

### Table: `runs`
```sql
id: UUID PRIMARY KEY DEFAULT gen_random_uuid()
project_id: UUID REFERENCES projects(id) ON DELETE CASCADE
external_id: VARCHAR(255) -- SDK-provided ID
agent_name: VARCHAR(255)
status: VARCHAR(50) DEFAULT 'running' -- running, completed, failed, paused
input: JSONB
output: JSONB
metadata: JSONB
error: JSONB
started_at: TIMESTAMP DEFAULT NOW()
ended_at: TIMESTAMP
created_at: TIMESTAMP DEFAULT NOW()
```

### Table: `run_steps`
```sql
id: UUID PRIMARY KEY DEFAULT gen_random_uuid()
run_id: UUID REFERENCES runs(id) ON DELETE CASCADE
step_index: INTEGER NOT NULL
step_type: VARCHAR(50) NOT NULL -- llm_call, tool_call, retrieval, custom, error
name: VARCHAR(255)
input: JSONB
output: JSONB
metadata: JSONB
error: JSONB
tokens_used: INTEGER
latency_ms: INTEGER
started_at: TIMESTAMP
ended_at: TIMESTAMP
created_at: TIMESTAMP DEFAULT NOW()

INDEX idx_run_steps_run_id ON run_steps(run_id)
INDEX idx_run_steps_step_index ON run_steps(run_id, step_index)
```

### Table: `tests`
```sql
id: UUID PRIMARY KEY DEFAULT gen_random_uuid()
project_id: UUID REFERENCES projects(id) ON DELETE CASCADE
name: VARCHAR(255) NOT NULL
description: TEXT
test_type: VARCHAR(50) -- assertion, comparison, custom
config: JSONB NOT NULL -- Contains test definition
enabled: BOOLEAN DEFAULT true
created_at: TIMESTAMP DEFAULT NOW()
updated_at: TIMESTAMP DEFAULT NOW()
```

### Table: `test_runs`
```sql
id: UUID PRIMARY KEY DEFAULT gen_random_uuid()
test_id: UUID REFERENCES tests(id) ON DELETE CASCADE
run_id: UUID REFERENCES runs(id) ON DELETE SET NULL
status: VARCHAR(50) NOT NULL -- passed, failed, error, skipped
result: JSONB
error: JSONB
duration_ms: INTEGER
executed_at: TIMESTAMP DEFAULT NOW()
```

### Table: `breakpoints`
```sql
id: UUID PRIMARY KEY DEFAULT gen_random_uuid()
project_id: UUID REFERENCES projects(id) ON DELETE CASCADE
name: VARCHAR(255)
condition_type: VARCHAR(50) NOT NULL -- step_type, step_name, custom
condition_value: JSONB NOT NULL
enabled: BOOLEAN DEFAULT true
created_at: TIMESTAMP DEFAULT NOW()
updated_at: TIMESTAMP DEFAULT NOW()
```

### Table: `mcp_tools`
```sql
id: UUID PRIMARY KEY DEFAULT gen_random_uuid()
project_id: UUID REFERENCES projects(id) ON DELETE CASCADE
tool_name: VARCHAR(255) NOT NULL
description: TEXT
input_schema: JSONB
server_name: VARCHAR(255)
created_at: TIMESTAMP DEFAULT NOW()
updated_at: TIMESTAMP DEFAULT NOW()

UNIQUE(project_id, tool_name)
```

### Table: `mcp_logs`
```sql
id: UUID PRIMARY KEY DEFAULT gen_random_uuid()
project_id: UUID REFERENCES projects(id) ON DELETE CASCADE
run_id: UUID REFERENCES runs(id) ON DELETE SET NULL
tool_id: UUID REFERENCES mcp_tools(id) ON DELETE SET NULL
log_type: VARCHAR(50) NOT NULL -- call, response, error
request: JSONB
response: JSONB
error: JSONB
latency_ms: INTEGER
created_at: TIMESTAMP DEFAULT NOW()

INDEX idx_mcp_logs_run_id ON mcp_logs(run_id)
INDEX idx_mcp_logs_project_id ON mcp_logs(project_id)
```

---

## 🔧 BACKEND STRUCTURE

### Directory Structure
```
backend/
├── alembic/
│   ├── versions/
│   └── env.py
├── app/
│   ├── __init__.py
│   ├── main.py
│   ├── config.py
│   ├── database.py
│   ├── dependencies.py
│   ├── models/
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── project.py
│   │   ├── api_key.py
│   │   ├── run.py
│   │   ├── run_step.py
│   │   ├── test.py
│   │   ├── test_run.py
│   │   ├── breakpoint.py
│   │   ├── mcp_tool.py
│   │   └── mcp_log.py
│   ├── schemas/
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── project.py
│   │   ├── api_key.py
│   │   ├── run.py
│   │   ├── run_step.py
│   │   ├── test.py
│   │   ├── test_run.py
│   │   ├── breakpoint.py
│   │   ├── mcp.py
│   │   └── common.py
│   ├── routers/
│   │   ├── __init__.py
│   │   ├── auth.py
│   │   ├── users.py
│   │   ├── projects.py
│   │   ├── api_keys.py
│   │   ├── ingest.py
│   │   ├── runs.py
│   │   ├── tests.py
│   │   ├── breakpoints.py
│   │   └── mcp.py
│   ├── services/
│   │   ├── __init__.py
│   │   ├── auth_service.py
│   │   ├── run_service.py
│   │   ├── test_service.py
│   │   └── mcp_service.py
│   └── middleware/
│       ├── __init__.py
│       └── api_key_auth.py
├── alembic.ini
├── requirements.txt
├── Dockerfile
└── .env.example
```

### Core Files

#### `app/config.py`
```python
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str
    JWT_SECRET: str
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRATION_HOURS: int = 24
    CORS_ORIGINS: list[str] = ["http://localhost:5173"]
    
    class Config:
        env_file = ".env"

settings = Settings()
```

#### `app/database.py`
- Create async engine with asyncpg
- Create async sessionmaker
- Define `get_db` async dependency
- Use `async_sessionmaker` from SQLAlchemy 2.x

#### `app/main.py`
- Initialize FastAPI app
- Configure CORS middleware with dynamic origins from settings
- Include all routers with appropriate prefixes
- Add exception handlers
- Health check endpoint at `/health`

---

## 📡 API ENDPOINTS

### Authentication Router (`/api/auth`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/register` | Create new user | None |
| POST | `/login` | Get JWT token | None |
| GET | `/me` | Get current user | JWT |
| POST | `/logout` | Invalidate token | JWT |

### Projects Router (`/api/projects`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/` | List user's projects | JWT |
| POST | `/` | Create project | JWT |
| GET | `/{id}` | Get project details | JWT |
| PATCH | `/{id}` | Update project | JWT |
| DELETE | `/{id}` | Delete project | JWT |
| GET | `/{id}/stats` | Get project statistics | JWT |

### API Keys Router (`/api/projects/{project_id}/api-keys`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/` | List project API keys | JWT |
| POST | `/` | Create API key (returns full key once) | JWT |
| DELETE | `/{key_id}` | Revoke API key | JWT |

### Ingest Router (`/api/ingest`) — SDK Endpoints
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/run` | Create new run | API Key |
| POST | `/run/{run_id}/step` | Add step to run | API Key |
| PATCH | `/run/{run_id}` | Update run (status, output, error) | API Key |
| POST | `/run/{run_id}/end` | End run | API Key |
| POST | `/mcp/tool` | Register MCP tool | API Key |
| POST | `/mcp/log` | Log MCP call | API Key |

### Runs Router (`/api/runs`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/` | List runs (filterable by project, status, date) | JWT |
| GET | `/{id}` | Get run with all steps | JWT |
| GET | `/{id}/steps` | Get run steps (paginated) | JWT |
| GET | `/{id}/timeline` | Get timeline data for visualization | JWT |
| POST | `/{id}/replay` | Create replay from step | JWT |
| DELETE | `/{id}` | Delete run | JWT |

### Tests Router (`/api/tests`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/` | List tests (by project) | JWT |
| POST | `/` | Create test | JWT |
| GET | `/{id}` | Get test details | JWT |
| PATCH | `/{id}` | Update test | JWT |
| DELETE | `/{id}` | Delete test | JWT |
| POST | `/{id}/run` | Execute test manually | JWT |
| GET | `/{id}/runs` | Get test run history | JWT |

### Test Runs Router (`/api/test-runs`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/` | List test runs (filterable) | JWT |
| GET | `/{id}` | Get test run details | JWT |

### Breakpoints Router (`/api/breakpoints`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/` | List breakpoints (by project) | JWT |
| POST | `/` | Create breakpoint | JWT |
| PATCH | `/{id}` | Update breakpoint | JWT |
| DELETE | `/{id}` | Delete breakpoint | JWT |
| POST | `/{id}/toggle` | Enable/disable breakpoint | JWT |

### MCP Router (`/api/mcp`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/tools` | List MCP tools (by project) | JWT |
| GET | `/tools/{id}` | Get tool details | JWT |
| GET | `/logs` | List MCP logs (filterable) | JWT |
| GET | `/logs/{id}` | Get log details | JWT |
| GET | `/stats` | Get MCP usage statistics | JWT |

---

## 🖥 FRONTEND STRUCTURE

### Directory Structure
```
frontend/
├── public/
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── index.css
│   ├── api/
│   │   ├── client.ts
│   │   ├── auth.ts
│   │   ├── projects.ts
│   │   ├── runs.ts
│   │   ├── tests.ts
│   │   ├── breakpoints.ts
│   │   └── mcp.ts
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Table.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Tabs.tsx
│   │   │   ├── Dropdown.tsx
│   │   │   ├── Toast.tsx
│   │   │   ├── Skeleton.tsx
│   │   │   └── EmptyState.tsx
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Header.tsx
│   │   │   ├── Layout.tsx
│   │   │   └── ProjectSwitcher.tsx
│   │   ├── runs/
│   │   │   ├── RunsList.tsx
│   │   │   ├── RunCard.tsx
│   │   │   ├── RunTimeline.tsx
│   │   │   ├── RunTimelineStep.tsx
│   │   │   ├── StepInspector.tsx
│   │   │   ├── StepInputOutput.tsx
│   │   │   ├── ReplayControls.tsx
│   │   │   └── RunFilters.tsx
│   │   ├── tests/
│   │   │   ├── TestsList.tsx
│   │   │   ├── TestCard.tsx
│   │   │   ├── TestEditor.tsx
│   │   │   ├── TestRunResult.tsx
│   │   │   └── TestRunHistory.tsx
│   │   ├── mcp/
│   │   │   ├── McpToolsList.tsx
│   │   │   ├── McpToolCard.tsx
│   │   │   ├── McpLogsList.tsx
│   │   │   ├── McpLogDetail.tsx
│   │   │   └── McpStats.tsx
│   │   ├── breakpoints/
│   │   │   ├── BreakpointsList.tsx
│   │   │   ├── BreakpointEditor.tsx
│   │   │   └── BreakpointConditionBuilder.tsx
│   │   ├── settings/
│   │   │   ├── ApiKeysList.tsx
│   │   │   ├── ApiKeyCreate.tsx
│   │   │   └── ProjectSettings.tsx
│   │   └── dashboard/
│   │       ├── DashboardStats.tsx
│   │       ├── RecentRuns.tsx
│   │       ├── ErrorsChart.tsx
│   │       └── TestHealthChart.tsx
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useProject.ts
│   │   ├── useRuns.ts
│   │   ├── useTests.ts
│   │   └── useToast.ts
│   ├── stores/
│   │   ├── authStore.ts
│   │   └── projectStore.ts
│   ├── pages/
│   │   ├── LoginPage.tsx
│   │   ├── RegisterPage.tsx
│   │   ├── DashboardPage.tsx
│   │   ├── RunsPage.tsx
│   │   ├── RunDetailPage.tsx
│   │   ├── TestsPage.tsx
│   │   ├── TestDetailPage.tsx
│   │   ├── McpInspectorPage.tsx
│   │   ├── BreakpointsPage.tsx
│   │   ├── SettingsPage.tsx
│   │   └── NotFoundPage.tsx
│   ├── types/
│   │   └── index.ts
│   └── utils/
│       ├── formatters.ts
│       ├── constants.ts
│       └── cn.ts
├── tailwind.config.js
├── vite.config.ts
├── tsconfig.json
├── package.json
└── .env.example
```

---

## 📄 PAGE SPECIFICATIONS

### 1. Login Page (`/login`)
- Email and password form
- Link to register
- JWT stored in localStorage
- Redirect to dashboard on success

### 2. Register Page (`/register`)
- Email, password, name form
- Auto-login after registration
- Create default project on registration

### 3. Dashboard Page (`/dashboard`)
- Project selector in header
- Stats cards: Total Runs, Failed Runs, Avg Latency, Test Pass Rate
- Recent runs list (last 10)
- Error rate chart (last 7 days)
- Test health pie chart (passed/failed/error)

### 4. Runs Page (`/runs`)
- Filterable table of runs
- Filters: status, date range, agent name
- Each row shows: agent name, status badge, step count, duration, timestamp
- Click row → Run Detail Page
- Pagination

### 5. Run Detail Page (`/runs/:id`)
**Two-panel layout:**

**Left Panel — Timeline:**
- Vertical timeline of all steps
- Each step shows: icon (by type), name, duration, status indicator
- Click step → loads in inspector
- Color coding: green (success), red (error), yellow (warning), blue (in progress)

**Right Panel — Step Inspector:**
- Tabs: Input, Output, Metadata, Error
- JSON viewer with syntax highlighting and collapse/expand
- Copy button for each section
- If error: red highlighted error display with stack trace
- Token usage and latency display

**Top Bar:**
- Run status badge
- Agent name
- Total duration
- Replay button → opens replay modal

**Replay Modal:**
- Select starting step
- Confirm replay
- Shows new run ID when created

### 6. Tests Page (`/tests`)
- List of tests with cards
- Each card: name, type, last run status, run count
- Create test button → opens editor modal
- Click card → Test Detail Page

### 7. Test Detail Page (`/tests/:id`)
- Test configuration display
- Edit button
- Run test button
- Run history table: timestamp, status, duration, linked run
- Click run → shows result detail panel

### 8. MCP Inspector Page (`/mcp`)
**Three tabs:**

**Tools Tab:**
- Grid of MCP tools registered in project
- Each tool card: name, description, server name
- Click → shows input schema in modal

**Logs Tab:**
- Table of MCP calls
- Columns: timestamp, tool name, type (call/response/error), latency
- Click row → shows full request/response JSON

**Stats Tab:**
- Total calls chart
- Error rate by tool
- Average latency by tool
- Most used tools

### 9. Breakpoints Page (`/breakpoints`)
- List of breakpoints
- Each shows: name, condition type, condition value, enabled toggle
- Create button → opens editor
- Edit/delete actions

**Breakpoint Editor Modal:**
- Name input
- Condition type dropdown: step_type, step_name, custom
- Condition value input (changes based on type)
- For custom: JSON editor for complex conditions
- Enable/disable toggle

### 10. Settings Page (`/settings`)
**Tabs:**

**Project Tab:**
- Project name edit
- Project description edit
- Delete project (with confirmation)

**API Keys Tab:**
- List of API keys
- Shows: key prefix (first 8 chars), name, created date, last used
- Create key button → shows full key ONCE in modal with copy button
- Revoke button per key

---

## 🎨 UI DESIGN SPECIFICATIONS

### Theme
- Dark mode by default
- Background: `#0a0a0f` (near black)
- Card background: `#12121a`
- Border color: `#1e1e2e`
- Primary accent: `#6366f1` (indigo)
- Success: `#22c55e`
- Error: `#ef4444`
- Warning: `#f59e0b`
- Text primary: `#f8fafc`
- Text secondary: `#94a3b8`

### Components Style
- Rounded corners: `rounded-lg` (8px)
- Cards: subtle border, slight shadow
- Buttons: solid fill for primary, outline for secondary
- Inputs: dark background, border on focus
- Tables: striped rows, hover state

### Sidebar
- Fixed left, 240px width
- Logo at top
- Navigation links with icons:
  - Dashboard
  - Runs
  - Tests
  - MCP Inspector
  - Breakpoints
  - Settings
- Project switcher at bottom
- Collapsible on mobile

---

## 🔐 AUTHENTICATION IMPLEMENTATION

### Backend JWT Flow
1. `/api/auth/login` validates credentials, returns JWT
2. JWT contains: `user_id`, `email`, `exp`
3. JWT sent via `Authorization: Bearer <token>` header
4. `get_current_user` dependency validates JWT, returns user

### API Key Flow (for SDK)
1. API key sent via `X-Agentscope-Key` header
2. Key is hashed and looked up in `api_keys` table
3. Must not be revoked
4. Updates `last_used_at` on each use
5. Returns associated project

### Frontend Auth
- JWT stored in localStorage
- Auth state in Zustand store
- Protected routes redirect to login
- API client automatically attaches token

---

## 📦 PYDANTIC SCHEMAS (Key Examples)

```python
# Run schemas
class RunCreate(BaseModel):
    external_id: str | None = None
    agent_name: str
    input: dict | None = None
    metadata: dict | None = None

class RunStepCreate(BaseModel):
    step_type: Literal["llm_call", "tool_call", "retrieval", "custom", "error"]
    name: str
    input: dict | None = None
    output: dict | None = None
    metadata: dict | None = None
    error: dict | None = None
    tokens_used: int | None = None
    latency_ms: int | None = None

class RunResponse(BaseModel):
    id: UUID
    project_id: UUID
    external_id: str | None
    agent_name: str
    status: str
    input: dict | None
    output: dict | None
    metadata: dict | None
    error: dict | None
    started_at: datetime
    ended_at: datetime | None
    steps: list[RunStepResponse] | None = None
    
    class Config:
        from_attributes = True

# Test schemas  
class TestCreate(BaseModel):
    name: str
    description: str | None = None
    test_type: Literal["assertion", "comparison", "custom"]
    config: dict

# Breakpoint schemas
class BreakpointCreate(BaseModel):
    name: str | None = None
    condition_type: Literal["step_type", "step_name", "custom"]
    condition_value: dict
    enabled: bool = True
```

---

## 🐳 DOCKERFILE

```dockerfile
FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

---

## 📋 REQUIREMENTS.TXT

```
fastapi>=0.109.0
uvicorn[standard]>=0.27.0
sqlalchemy[asyncio]>=2.0.0
asyncpg>=0.29.0
alembic>=1.13.0
pydantic>=2.5.0
pydantic-settings>=2.1.0
python-jose[cryptography]>=3.3.0
passlib[bcrypt]>=1.7.4
python-multipart>=0.0.6
```

---

## 🚀 DEPLOYMENT FILES

### Backend `.env.example`
```
DATABASE_URL=postgresql+asyncpg://user:pass@host:5432/dbname
JWT_SECRET=your-secret-key-here
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=24
CORS_ORIGINS=["http://localhost:5173","https://your-frontend.vercel.app"]
```

### Frontend `.env.example`
```
VITE_API_BASE_URL=http://localhost:8000/api
```

---

## ✅ IMPLEMENTATION CHECKLIST

Ensure ALL of the following are implemented:

### Backend
- [ ] All database models with relationships
- [ ] Alembic migration for initial schema
- [ ] JWT authentication middleware
- [ ] API key authentication middleware
- [ ] All routers with complete CRUD
- [ ] Pydantic schemas for all endpoints
- [ ] CORS configuration
- [ ] Error handling with proper HTTP codes
- [ ] Async database sessions
- [ ] Health check endpoint

### Frontend
- [ ] All pages listed above
- [ ] Responsive sidebar navigation
- [ ] Project switcher functionality
- [ ] Run timeline with interactive steps
- [ ] Step inspector with JSON viewer
- [ ] Test management UI
- [ ] MCP inspector with all tabs
- [ ] Breakpoint editor
- [ ] API key management (show once on create)
- [ ] Toast notifications
- [ ] Loading states and skeletons
- [ ] Empty states for lists
- [ ] Error handling and display
- [ ] Form validation

---

## 🎯 CRITICAL REQUIREMENTS

1. **Do NOT use any mock data** — all data comes from API
2. **Do NOT skip any endpoint** — implement all listed endpoints
3. **Do NOT simplify the timeline** — it must be interactive and detailed
4. **Do NOT use light mode** — dark mode only
5. **Ensure proper TypeScript types** — no `any` types
6. **Implement proper error handling** — try/catch, error boundaries
7. **Use proper async/await** — no blocking calls
8. **Follow REST conventions** — proper HTTP methods and status codes

---

## 📝 FINAL NOTES

Generate both the complete backend and frontend codebases. The backend should be immediately deployable to Railway/Fly.io/Render with the provided Dockerfile. The frontend should build successfully for Vercel deployment.

Include meaningful sample code comments explaining complex logic. Ensure all imports are correct and all files are properly connected.

This is a production application — code quality matters.
