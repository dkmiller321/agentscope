import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../api/client'
import { Plus, Copy, Trash2, Key, AlertTriangle } from 'lucide-react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import type { ApiKey, CreateApiKeyRequest, ApiKeyCreateResponse } from '../types'
import { useProjectStore } from '../stores/projectStore'

export default function ApiKeysPage() {
  const queryClient = useQueryClient()
  const { selectedProject } = useProjectStore()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showCopyModal, setShowCopyModal] = useState(false)
  const [deletingKey, setDeletingKey] = useState<ApiKey | null>(null)
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<ApiKeyCreateResponse | null>(null)

  // Fetch API keys
  const { data: apiKeys = [], isLoading } = useQuery({
    queryKey: ['apiKeys', selectedProject?.id],
    queryFn: () => api.getApiKeys(selectedProject!.id),
    enabled: !!selectedProject,
  })

  // Create API key mutation
  const createApiKeyMutation = useMutation({
    mutationFn: (data: CreateApiKeyRequest) =>
      api.createApiKey(selectedProject!.id, data),
    onSuccess: (newKey) => {
      queryClient.invalidateQueries({ queryKey: ['apiKeys', selectedProject?.id] })
      toast.success('API key created successfully')
      setShowCreateModal(false)
      setNewlyCreatedKey(newKey)
      setShowCopyModal(true)
    },
    onError: () => {
      toast.error('Failed to create API key')
    },
  })

  // Revoke API key mutation
  const revokeApiKeyMutation = useMutation({
    mutationFn: (keyId: string) => api.revokeApiKey(selectedProject!.id, keyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['apiKeys', selectedProject?.id] })
      toast.success('API key revoked successfully')
      setShowDeleteModal(false)
      setDeletingKey(null)
    },
    onError: () => {
      toast.error('Failed to revoke API key')
    },
  })

  const handleRevoke = (key: ApiKey) => {
    setDeletingKey(key)
    setShowDeleteModal(true)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard')
  }

  if (!selectedProject) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="bg-gray-900 rounded-lg border border-gray-800 p-12 text-center">
          <Key className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No project selected</h3>
          <p className="text-gray-400">
            Please select a project from the dropdown to manage API keys
          </p>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Loading API keys...</div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">API Keys</h1>
          <p className="text-gray-400 text-sm mt-1">
            Manage API keys for {selectedProject.name}
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Create API Key
        </button>
      </div>

      {/* Warning Banner */}
      <div className="bg-yellow-900/20 border border-yellow-800/50 rounded-lg p-4 mb-6 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-yellow-200 text-sm font-medium">
            API keys are shown only once at creation
          </p>
          <p className="text-yellow-300/80 text-sm mt-1">
            Make sure to copy and save your API keys securely. You won't be able to see the full
            key again.
          </p>
        </div>
      </div>

      {apiKeys.length === 0 ? (
        <div className="bg-gray-900 rounded-lg border border-gray-800 p-12 text-center">
          <Key className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No API keys yet</h3>
          <p className="text-gray-400 mb-4">
            Create your first API key to start sending data to AgentScope
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create API Key
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {apiKeys.map((key) => (
            <div
              key={key.id}
              className={`bg-gray-900 rounded-lg border p-4 ${
                key.revoked_at
                  ? 'border-gray-800 opacity-50'
                  : 'border-gray-800 hover:border-gray-700'
              } transition-colors`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-white font-medium">{key.name}</h3>
                    {key.revoked_at ? (
                      <span className="px-2 py-1 text-xs bg-red-600/20 text-red-400 rounded">
                        Revoked
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-xs bg-green-600/20 text-green-400 rounded">
                        Active
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <code className="bg-gray-800 px-2 py-1 rounded text-gray-300">
                        {key.key_prefix}...
                      </code>
                      <button
                        onClick={() => copyToClipboard(key.key_prefix)}
                        className="text-gray-400 hover:text-white transition-colors"
                        title="Copy prefix"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                    <span className="text-gray-500">
                      Created {format(new Date(key.created_at), 'MMM d, yyyy')}
                    </span>
                    {key.revoked_at && (
                      <span className="text-gray-500">
                        Revoked {format(new Date(key.revoked_at), 'MMM d, yyyy')}
                      </span>
                    )}
                  </div>
                </div>
                {!key.revoked_at && (
                  <button
                    onClick={() => handleRevoke(key)}
                    className="flex items-center px-3 py-2 bg-red-600/10 text-red-400 rounded-lg hover:bg-red-600/20 transition-colors text-sm"
                  >
                    <Trash2 className="w-4 h-4 mr-1.5" />
                    Revoke
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <CreateApiKeyModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={(data) => createApiKeyMutation.mutate(data)}
          isLoading={createApiKeyMutation.isPending}
        />
      )}

      {/* Copy Key Modal */}
      {showCopyModal && newlyCreatedKey && (
        <CopyKeyModal
          apiKey={newlyCreatedKey}
          onClose={() => {
            setShowCopyModal(false)
            setNewlyCreatedKey(null)
          }}
        />
      )}

      {/* Revoke Confirmation */}
      {showDeleteModal && deletingKey && (
        <RevokeConfirmModal
          keyName={deletingKey.name}
          onClose={() => {
            setShowDeleteModal(false)
            setDeletingKey(null)
          }}
          onConfirm={() => revokeApiKeyMutation.mutate(deletingKey.id)}
          isLoading={revokeApiKeyMutation.isPending}
        />
      )}
    </div>
  )
}

// Create API Key Modal
function CreateApiKeyModal({
  onClose,
  onSubmit,
  isLoading,
}: {
  onClose: () => void
  onSubmit: (data: CreateApiKeyRequest) => void
  isLoading: boolean
}) {
  const [name, setName] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({ name })
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg border border-gray-800 max-w-md w-full p-6">
        <h2 className="text-xl font-bold text-white mb-4">Create API Key</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Key Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Production Key"
              required
            />
            <p className="text-xs text-gray-500 mt-2">
              Give this key a descriptive name to help you identify it later
            </p>
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

// Copy Key Modal
function CopyKeyModal({
  apiKey,
  onClose,
}: {
  apiKey: ApiKeyCreateResponse
  onClose: () => void
}) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(apiKey.key)
    setCopied(true)
    toast.success('API key copied to clipboard')
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg border border-gray-800 max-w-md w-full p-6">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-green-600/20 flex items-center justify-center flex-shrink-0">
            <Key className="w-5 h-5 text-green-400" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-white">API Key Created</h2>
            <p className="text-sm text-gray-400 mt-1">
              Make sure to copy your API key now. You won't be able to see it again!
            </p>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-4 mb-4">
          <label className="block text-xs text-gray-400 mb-2">Your API Key</label>
          <div className="flex items-center gap-2">
            <code className="flex-1 text-sm text-white font-mono break-all">
              {apiKey.key}
            </code>
            <button
              onClick={handleCopy}
              className="flex-shrink-0 p-2 text-gray-400 hover:text-white bg-gray-700 rounded hover:bg-gray-600 transition-colors"
              title="Copy to clipboard"
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="bg-yellow-900/20 border border-yellow-800/50 rounded-lg p-3 mb-4">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-yellow-200">
              Store this key securely. Anyone with this key can send data to your project.
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          {copied ? 'Done' : 'I have saved my key'}
        </button>
      </div>
    </div>
  )
}

// Revoke Confirmation Modal
function RevokeConfirmModal({
  keyName,
  onClose,
  onConfirm,
  isLoading,
}: {
  keyName: string
  onClose: () => void
  onConfirm: () => void
  isLoading: boolean
}) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg border border-gray-800 max-w-md w-full p-6">
        <h2 className="text-xl font-bold text-white mb-4">Revoke API Key</h2>
        <p className="text-gray-400 mb-6">
          Are you sure you want to revoke <strong className="text-white">{keyName}</strong>?
          This will immediately disable the key and any applications using it will stop working.
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
            {isLoading ? 'Revoking...' : 'Revoke'}
          </button>
        </div>
      </div>
    </div>
  )
}
