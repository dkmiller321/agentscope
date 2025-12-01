export interface User {
  id: string
  email: string
  name: string | null
  created_at: string
  updated_at: string
}

export interface Project {
  id: string
  user_id: string
  name: string
  description: string | null
  created_at: string
  updated_at: string
}

export interface Run {
  id: string
  project_id: string
  external_id: string | null
  agent_name: string
  status: string
  input: Record<string, any> | null
  output: Record<string, any> | null
  metadata: Record<string, any> | null
  error: Record<string, any> | null
  started_at: string
  ended_at: string | null
  created_at: string
}

export interface RunStep {
  id: string
  run_id: string
  step_index: number
  step_type: string
  name: string
  input: Record<string, any> | null
  output: Record<string, any> | null
  metadata: Record<string, any> | null
  error: Record<string, any> | null
  tokens_used: number | null
  latency_ms: number | null
  started_at: string | null
  ended_at: string | null
  created_at: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  name?: string
}

export interface TokenResponse {
  access_token: string
  token_type: string
  user: User
}

export interface ApiKey {
  id: string
  project_id: string
  key_prefix: string
  name: string
  created_at: string
  revoked_at: string | null
}

export interface ApiKeyCreateResponse {
  id: string
  project_id: string
  key: string
  key_prefix: string
  name: string
  created_at: string
}

export interface ProjectStats {
  total_runs: number
  failed_runs: number
  avg_latency_ms: number | null
  test_pass_rate: number | null
  recent_runs: number
}

export interface CreateProjectRequest {
  name: string
  description?: string
}

export interface UpdateProjectRequest {
  name?: string
  description?: string
}

export interface CreateApiKeyRequest {
  name: string
}

export interface RunsQueryParams {
  project_id?: string
  limit?: number
  offset?: number
  status?: string
}
