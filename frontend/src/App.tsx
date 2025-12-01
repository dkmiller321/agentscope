import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from './stores/authStore'
import { useProjectStore } from './stores/projectStore'
import { api } from './api/client'
import Layout from './components/Layout'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import RunsPage from './pages/RunsPage'
import RunDetailPage from './pages/RunDetailPage'
import ProjectsPage from './pages/ProjectsPage'
import ApiKeysPage from './pages/ApiKeysPage'

function App() {
  const { token } = useAuthStore()

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={!token ? <LoginPage /> : <Navigate to="/dashboard" />} />
        <Route path="/register" element={!token ? <RegisterPage /> : <Navigate to="/dashboard" />} />
        
        {/* Authenticated routes with layout */}
        <Route element={token ? <AuthenticatedLayout /> : <Navigate to="/login" />}>
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

// Wrapper component that handles project loading and auto-selection
function AuthenticatedLayout() {
  const { selectedProject, setSelectedProject, projects: storedProjects, setProjects } = useProjectStore()

  // Fetch projects on mount
  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: api.getProjects,
  })

  // Update projects in store when fetched data changes
  useEffect(() => {
    // Only update if the projects have actually changed (compare by stringifying)
    const projectsChanged = JSON.stringify(projects) !== JSON.stringify(storedProjects)
    if (projectsChanged) {
      setProjects(projects)
    }
  }, [projects])

  // Auto-select project when projects change
  useEffect(() => {
    if (storedProjects.length > 0) {
      // If no project is selected or the selected project is no longer valid
      if (!selectedProject || !storedProjects.find(p => p.id === selectedProject.id)) {
        // Try to get last selected project from localStorage
        const storedProjectId = localStorage.getItem('selectedProjectId')
        const storedProject = storedProjectId 
          ? storedProjects.find(p => p.id === storedProjectId)
          : null
        
        // Select stored project if valid, otherwise select first project
        setSelectedProject(storedProject || storedProjects[0])
      }
    }
  }, [storedProjects, selectedProject])

  // Persist selected project to localStorage
  useEffect(() => {
    if (selectedProject) {
      localStorage.setItem('selectedProjectId', selectedProject.id)
    }
  }, [selectedProject])

  return <Layout />
}

export default App
