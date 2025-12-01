import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '../api/client'
import { useProjectStore } from '../stores/projectStore'
import { Link } from 'react-router-dom'
import { formatDistanceToNow } from 'date-fns'
import { Filter, FolderKanban, Play } from 'lucide-react'
import type { Run } from '../types'

export default function RunsPage() {
  const { selectedProject } = useProjectStore()
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'date' | 'duration' | 'status'>('date')

  // Fetch runs
  const { data: runs = [], isLoading } = useQuery({
    queryKey: ['runs', selectedProject?.id, statusFilter],
    queryFn: () =>
      api.getRuns({
        project_id: selectedProject!.id,
        status: statusFilter === 'all' ? undefined : statusFilter,
      }),
    enabled: !!selectedProject,
  })

  if (!selectedProject) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="bg-gray-900 rounded-lg border border-gray-800 p-12 text-center">
          <FolderKanban className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No project selected</h3>
          <p className="text-gray-400">
            Please select a project from the dropdown to view runs
          </p>
        </div>
      </div>
    )
  }

  // Sort runs
  const sortedRuns = [...runs].sort((a, b) => {
    if (sortBy === 'date') {
      return new Date(b.started_at).getTime() - new Date(a.started_at).getTime()
    }
    if (sortBy === 'duration') {
      const durationA = a.ended_at
        ? new Date(a.ended_at).getTime() - new Date(a.started_at).getTime()
        : 0
      const durationB = b.ended_at
        ? new Date(b.ended_at).getTime() - new Date(b.started_at).getTime()
        : 0
      return durationB - durationA
    }
    if (sortBy === 'status') {
      return a.status.localeCompare(b.status)
    }
    return 0
  })

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">Runs</h1>
        <p className="text-gray-400">{selectedProject.name}</p>
      </div>

      {/* Filters */}
      <div className="bg-gray-900 rounded-lg border border-gray-800 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <span className="text-sm text-gray-400">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="all">All</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
                <option value="running">Running</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="date">Date</option>
                <option value="duration">Duration</option>
                <option value="status">Status</option>
              </select>
            </div>
          </div>

          <div className="text-sm text-gray-400">
            {runs.length} {runs.length === 1 ? 'run' : 'runs'}
          </div>
        </div>
      </div>

      {/* Runs List */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-400">Loading runs...</div>
        </div>
      ) : sortedRuns.length === 0 ? (
        <div className="bg-gray-900 rounded-lg border border-gray-800 p-12 text-center">
          <Play className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">
            {statusFilter === 'all' ? 'No runs yet' : `No ${statusFilter} runs`}
          </h3>
          <p className="text-gray-400">
            {statusFilter === 'all'
              ? 'Start sending data from your agent to see runs here'
              : 'Try changing the filter to see other runs'}
          </p>
        </div>
      ) : (
        <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800/50 border-b border-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Agent
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    External ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Started
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {sortedRuns.map((run) => (
                  <RunRow key={run.id} run={run} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

function RunRow({ run }: { run: Run }) {
  const duration = run.ended_at
    ? new Date(run.ended_at).getTime() - new Date(run.started_at).getTime()
    : null

  return (
    <tr className="hover:bg-gray-800/50 transition-colors">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-white font-medium">{run.agent_name}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-400">{run.external_id || '-'}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <StatusBadge status={run.status} />
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-400">
          {formatDistanceToNow(new Date(run.started_at), { addSuffix: true })}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-400">
          {duration ? `${Math.round(duration / 1000)}s` : '-'}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <Link
          to={`/runs/${run.id}`}
          className="text-indigo-400 hover:text-indigo-300 text-sm font-medium"
        >
          View Details
        </Link>
      </td>
    </tr>
  )
}

function StatusBadge({ status }: { status: string }) {
  const styles = {
    completed: 'bg-green-600/20 text-green-400',
    failed: 'bg-red-600/20 text-red-400',
    running: 'bg-blue-600/20 text-blue-400',
  }

  const style = styles[status as keyof typeof styles] || 'bg-gray-600/20 text-gray-400'

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded ${style}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  )
}
