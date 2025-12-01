# AgentScope — AI Agent Debugger & Testing Platform

AgentScope is a production-grade, full-stack SaaS application that enables developers to debug, inspect, replay, and test AI agents.

## Features

- **Run Ingestion**: SDK sends agent run data via API
- **Timeline Visualization**: Step-by-step execution viewer
- **Step Inspector**: Deep inspection of inputs, outputs, tool calls, errors
- **Replay Controls**: Re-run agent executions from any step
- **Test Suite**: Define tests, run them against agents, view results
- **Breakpoints**: Conditional pause points in agent execution
- **MCP Tool Inspector**: View Model Context Protocol tool definitions, calls, and errors
- **Project Management**: Multiple projects with separate API keys
- **Dashboard**: Overview of runs, errors, test health

## Technology Stack

### Backend
- FastAPI (Python 3.11+)
- PostgreSQL with asyncpg
- SQLAlchemy 2.x (async)
- Alembic (migrations)
- JWT authentication
- Pydantic v2

### Frontend
- React 18 with TypeScript
- Vite
- Tailwind CSS (dark mode)
- Zustand (state management)
- TanStack Query (React Query v5)
- React Router v6
- Axios

## Project Structure

```
AgentScope/
├── backend/               # FastAPI backend
│   ├── app/
│   │   ├── models/       # SQLAlchemy models
│   │   ├── schemas/      # Pydantic schemas
│   │   ├── routers/      # API endpoints
│   │   ├── services/     # Business logic
│   │   └── main.py       # FastAPI app
│   ├── alembic/          # Database migrations
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env.example
├── frontend/             # React frontend
│   ├── src/
│   │   ├── pages/        # React pages
│   │   ├── components/   # Reusable components
│   │   ├── api/          # API client
│   │   ├── stores/       # Zustand stores
│   │   └── types/        # TypeScript types
│   ├── package.json
│   └── .env.example
└── README.md
```

## Quick Start

### Prerequisites

- Python 3.11+
- Node.js 18+
- PostgreSQL 14+

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Create virtual environment and install dependencies:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

3. Create `.env` file from example:
```bash
cp .env.example .env
```

4. Update `.env` with your database credentials:
```env
DATABASE_URL=postgresql+asyncpg://user:password@localhost:5432/agentscope
JWT_SECRET=your-secret-key-change-this
```

5. Run database migrations:
```bash
alembic upgrade head
```

6. Start the development server:
```bash
uvicorn app.main:app --reload
```

Backend API will be available at http://localhost:8000
API documentation at http://localhost:8000/docs

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file from example:
```bash
cp .env.example .env
```

4. Start the development server:
```bash
npm run dev
```

Frontend will be available at http://localhost:5173

## Deployment

### Backend Deployment

The backend includes a Dockerfile for containerized deployment:

```bash
cd backend
docker build -t agentscope-backend .
docker run -p 8000:8000 --env-file .env agentscope-backend
```

Recommended platforms:
- Railway
- Fly.io
- Render
- Any Docker-compatible hosting

### Frontend Deployment

Build for production:

```bash
cd frontend
npm run build
```

The `dist` folder can be deployed to:
- Vercel (recommended)
- Netlify
- Cloudflare Pages
- Any static hosting

## Database Schema

The application uses PostgreSQL with the following main tables:

- `users` - User accounts
- `projects` - User projects
- `api_keys` - Project API keys for SDK authentication
- `runs` - Agent execution runs
- `run_steps` - Individual steps within runs
- `tests` - Test definitions
- `test_runs` - Test execution results
- `breakpoints` - Conditional breakpoints
- `mcp_tools` - MCP tool definitions
- `mcp_logs` - MCP tool call logs

## API Documentation

Once the backend is running, visit http://localhost:8000/docs for interactive API documentation (Swagger UI).

### Key Endpoints

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login and get JWT token
- `GET /api/projects` - List user's projects
- `POST /api/ingest/run` - Create new run (SDK endpoint)
- `POST /api/ingest/run/{run_id}/step` - Add step to run
- `GET /api/runs` - List runs
- `GET /api/runs/{id}` - Get run details with steps

## Development

### Running Tests

Backend tests (when implemented):
```bash
cd backend
pytest
```

Frontend tests (when implemented):
```bash
cd frontend
npm test
```

### Code Quality

Backend linting:
```bash
cd backend
ruff check .
```

Frontend linting:
```bash
cd frontend
npm run lint
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
- Open an issue on GitHub
- Check the API documentation at `/docs`

## Roadmap

- [ ] Enhanced test framework with more assertion types
- [ ] Real-time run monitoring via WebSocket
- [ ] Export runs and test results
- [ ] Team collaboration features
- [ ] Advanced analytics and insights
- [ ] SDK libraries for Python, JavaScript, Go
