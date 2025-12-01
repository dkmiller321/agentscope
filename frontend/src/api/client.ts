import axios from 'axios'
import { useAuthStore } from '../stores/authStore'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add auth token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle 401 responses
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Call logout to clear both localStorage and store
      useAuthStore.getState().logout()
      // Only redirect if not already on login/register pages
      if (!window.location.pathname.match(/^\/(login|register)/)) {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

// API Methods
import type {
  LoginRequest,
  RegisterRequest,
  TokenResponse,
  Project,
  CreateProjectRequest,
  UpdateProjectRequest,
  ProjectStats,
  ApiKey,
  ApiKeyCreateResponse,
  CreateApiKeyRequest,
  Run,
  RunStep,
  RunsQueryParams,
} from '../types'

export const api = {
  // Auth
  login: async (data: LoginRequest): Promise<TokenResponse> => {
    const response = await apiClient.post('/auth/login', data)
    return response.data
  },

  register: async (data: RegisterRequest): Promise<TokenResponse> => {
    const response = await apiClient.post('/auth/register', data)
    return response.data
  },

  // Projects
  getProjects: async (): Promise<Project[]> => {
    const response = await apiClient.get('/projects/')
    return response.data
  },

  createProject: async (data: CreateProjectRequest): Promise<Project> => {
    const response = await apiClient.post('/projects/', data)
    return response.data
  },

  updateProject: async (id: string, data: UpdateProjectRequest): Promise<Project> => {
    const response = await apiClient.patch(`/projects/${id}`, data)
    return response.data
  },

  deleteProject: async (id: string): Promise<void> => {
    await apiClient.delete(`/projects/${id}`)
  },

  getProjectStats: async (id: string): Promise<ProjectStats> => {
    const response = await apiClient.get(`/projects/${id}/stats`)
    return response.data
  },

  // API Keys
  getApiKeys: async (projectId: string): Promise<ApiKey[]> => {
    const response = await apiClient.get(`/projects/${projectId}/api-keys`)
    return response.data
  },

  createApiKey: async (
    projectId: string,
    data: CreateApiKeyRequest
  ): Promise<ApiKeyCreateResponse> => {
    const response = await apiClient.post(`/projects/${projectId}/api-keys`, data)
    return response.data
  },

  revokeApiKey: async (projectId: string, keyId: string): Promise<void> => {
    await apiClient.delete(`/projects/${projectId}/api-keys/${keyId}`)
  },

  // Runs
  getRuns: async (params?: RunsQueryParams): Promise<Run[]> => {
    const response = await apiClient.get('/runs/', { params })
    return response.data
  },

  getRun: async (id: string): Promise<Run> => {
    const response = await apiClient.get(`/runs/${id}`)
    return response.data
  },

  getRunSteps: async (runId: string): Promise<RunStep[]> => {
    const response = await apiClient.get(`/runs/${runId}/steps`)
    return response.data
  },
}

export default apiClient
