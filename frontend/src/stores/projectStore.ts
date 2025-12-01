import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Project } from '../types'

interface ProjectState {
  selectedProject: Project | null
  projects: Project[]
  setSelectedProject: (project: Project | null) => void
  setProjects: (projects: Project[]) => void
}

export const useProjectStore = create<ProjectState>()(
  persist(
    (set) => ({
      selectedProject: null,
      projects: [],
      setSelectedProject: (project) => set({ selectedProject: project }),
      setProjects: (projects) => set({ projects }),
    }),
    {
      name: 'project-storage',
      partialize: (state) => ({ selectedProjectId: state.selectedProject?.id }),
    }
  )
)
