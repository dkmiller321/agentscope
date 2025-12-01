import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../api/client'
import { Plus, Edit2, Trash2, FolderKanban } from 'lucide-react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import type { Project, CreateProjectRequest, UpdateProjectRequest } from '../types'
import { useProjectStore } from '../stores/projectStore'

export default function ProjectsPage() {
  const queryClient = useQueryClient()
  const { selectedProject, setSelectedProject } = useProjectStore()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [deletingProject, setDeletingProject] = useState<Project | null>(null)

  // Fetch projects
  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: api.getProjects,
  })

  // Create project mutation
  const createProjectMutation = useMutation({
    mutationFn: api.createProject,
    onSuccess: (newProject) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      toast.success('Project created successfully')
      setShowCreateModal(false)
      // Auto-select the new project if it's the first one
      if (projects.length === 0) {
        setSelectedProject(newProject)
      }
    },
    onError: () => {
      toast.error('Failed to create project')
    },
  })

  // Update project mutation
  const updateProjectMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProjectRequest }) =>
      api.updateProject(id, data),
    onSuccess: (updatedProject) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      toast.success('Project updated successfully')
      setShowEditModal(false)
      setEditingProject(null)
      // Update selected project if it was the one being edited
      if (selectedProject?.id === updatedProject.id) {
        setSelectedProject(updatedProject)
      }
    },
    onError: () => {
      toast.error('Failed to update project')
    },
  })

  // Delete project mutation
  const deleteProjectMutation = useMutation({
    mutationFn: api.deleteProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      toast.success('Project deleted successfully')
      setShowDeleteModal(false)
      setDeletingProject(null)
      // Clear selected project if it was deleted
      if (selectedProject?.id === deletingProject?.id) {
        setSelectedProject(null)
      }
    },
    onError: () => {
      toast.error('Failed to delete project')
    },
  })

  const handleEdit = (project: Project) => {
    setEditingProject(project)
    setShowEditModal(true)
  }

  const handleDelete = (project: Project) => {
    setDeletingProject(project)
    setShowDeleteModal(true)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Loading projects...</div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Projects</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Create Project
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="bg-gray-900 rounded-lg border border-gray-800 p-12 text-center">
          <FolderKanban className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No projects yet</h3>
          <p className="text-gray-400 mb-4">
            Create your first project to start tracking your AI agent runs
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create Project
          </button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <div
              key={project.id}
              className="bg-gray-900 rounded-lg border border-gray-800 p-6 hover:border-gray-700 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-1">{project.name}</h3>
                  {project.description && (
                    <p className="text-sm text-gray-400 line-clamp-2">{project.description}</p>
                  )}
                </div>
                {selectedProject?.id === project.id && (
                  <span className="ml-2 px-2 py-1 text-xs bg-indigo-600/20 text-indigo-400 rounded">
                    Active
                  </span>
                )}
              </div>
              <div className="text-xs text-gray-500 mb-4">
                Created {format(new Date(project.created_at), 'MMM d, yyyy')}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleEdit(project)}
                  className="flex-1 flex items-center justify-center px-3 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors text-sm"
                >
                  <Edit2 className="w-4 h-4 mr-1.5" />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(project)}
                  className="flex-1 flex items-center justify-center px-3 py-2 bg-red-600/10 text-red-400 rounded-lg hover:bg-red-600/20 transition-colors text-sm"
                >
                  <Trash2 className="w-4 h-4 mr-1.5" />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <CreateProjectModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={(data) => createProjectMutation.mutate(data)}
          isLoading={createProjectMutation.isPending}
        />
      )}

      {/* Edit Modal */}
      {showEditModal && editingProject && (
        <EditProjectModal
          project={editingProject}
          onClose={() => {
            setShowEditModal(false)
            setEditingProject(null)
          }}
          onSubmit={(data) =>
            updateProjectMutation.mutate({ id: editingProject.id, data })
          }
          isLoading={updateProjectMutation.isPending}
        />
      )}

      {/* Delete Confirmation */}
      {showDeleteModal && deletingProject && (
        <DeleteConfirmModal
          projectName={deletingProject.name}
          onClose={() => {
            setShowDeleteModal(false)
            setDeletingProject(null)
          }}
          onConfirm={() => deleteProjectMutation.mutate(deletingProject.id)}
          isLoading={deleteProjectMutation.isPending}
        />
      )}
    </div>
  )
}

// Create Project Modal
function CreateProjectModal({
  onClose,
  onSubmit,
  isLoading,
}: {
  onClose: () => void
  onSubmit: (data: CreateProjectRequest) => void
  isLoading: boolean
}) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({ name, description: description || undefined })
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg border border-gray-800 max-w-md w-full p-6">
        <h2 className="text-xl font-bold text-white mb-4">Create Project</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Project Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="My AI Project"
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Optional description"
              rows={3}
            />
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Edit Project Modal
function EditProjectModal({
  project,
  onClose,
  onSubmit,
  isLoading,
}: {
  project: Project
  onClose: () => void
  onSubmit: (data: UpdateProjectRequest) => void
  isLoading: boolean
}) {
  const [name, setName] = useState(project.name)
  const [description, setDescription] = useState(project.description || '')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({ name, description: description || undefined })
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg border border-gray-800 max-w-md w-full p-6">
        <h2 className="text-xl font-bold text-white mb-4">Edit Project</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Project Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              rows={3}
            />
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Delete Confirmation Modal
function DeleteConfirmModal({
  projectName,
  onClose,
  onConfirm,
  isLoading,
}: {
  projectName: string
  onClose: () => void
  onConfirm: () => void
  isLoading: boolean
}) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg border border-gray-800 max-w-md w-full p-6">
        <h2 className="text-xl font-bold text-white mb-4">Delete Project</h2>
        <p className="text-gray-400 mb-6">
          Are you sure you want to delete <strong className="text-white">{projectName}</strong>?
          This action cannot be undone and will delete all associated data.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
            disabled={isLoading}
          >
            {isLoading ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  )
}
