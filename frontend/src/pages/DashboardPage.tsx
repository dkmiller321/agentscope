import { useQuery } from '@tanstack/react-query'
import { api } from '../api/client'
import { useProjectStore } from '../stores/projectStore'
import { Link } from 'react-router-dom'
import { formatDistanceToNow } from 'date-fns'
import { Activity, AlertCircle, CheckCircle, Clock, FolderKanban } from 'lucide-react'

export default function DashboardPage() {
  const { selectedProject } = useProjectStore()

  // Fetch project stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['projectStats', selectedProject?.id],
    queryFn: () => api.getProjectStats(selectedProject!.id),
    enabled: !!selectedProject,
    refetchInterval: 30000, // Refresh every 30 seconds
  })

  // Fetch recent runs
  const { data: recentRuns = [], isLoading: runsLoading } = useQuery({
    queryKey: ['recentRuns', selectedProject?.id],
    queryFn: () =>
      api.getRuns({
        project_id: selectedProject!.id,
        limit: 10,
      }),
    enabled: !!selectedProject,
    refetchInterval: 30000,
  })

  if (!selectedProject) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="bg-gray-900 rounded-lg border border-gray-800 p-12 text-center">
          <FolderKanban className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No project selected</h3>
          <p className="text-gray-400 mb-4">
            Please select a project from the dropdown above to view your dashboard
          </p>
          <Link
            to="/projects"
            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Manage Projects
          </Link>
        </div>
      </div>
    )
  }

  const isLoading = statsLoading || runsLoading

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-gray-400">{selectedProject.name}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-gray-400 text-sm">Total Runs</h3>
            <Activity className="w-5 h-5 text-gray-600" />
          </div>
          <p className="text-3xl font-bold text-white">
            {isLoading ? '-' : stats?.total_runs || 0}
          </p>
        </div>

        <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-gray-400 text-sm">Failed Runs</h3>
            <AlertCircle className="w-5 h-5 text-gray-600" />
          </div>
          <p className="text-3xl font-bold text-red-400">
            {isLoading ? '-' : stats?.failed_runs || 0}
          </p>
        </div>

        <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-gray-400 text-sm">Avg Latency</h3>
            <Clock className="w-5 h-5 text-gray-600" />
          </div>
          <p className="text-3xl font-bold text-white">
            {isLoading
              ? '-'
              : stats?.avg_latency_ms
              ? `${Math.round(stats.avg_latency_ms)}ms`
              : '-'}
          </p>
        </div>

        <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-gray-400 text-sm">Test Pass Rate</h3>
            <CheckCircle className="w-5 h-5 text-gray-600" />
          </div>
          <p className="text-3xl font-bold text-green-400">
            {isLoading
              ? '-'
              : stats?.test_pass_rate !== null && stats?.test_pass_rate !== undefined
              ? `${Math.round(stats.test_pass_rate)}%`
              : '-'}
          </p>
        </div>
      </div>

      {/* Recent Runs */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4">Recent Runs</h2>
        <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center text-gray-400">Loading runs...</div>
          ) : recentRuns.length === 0 ? (
            <div className="p-8 text-center text-gray-400">No runs yet</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-800/50 border-b border-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Agent
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
                      External ID
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {recentRuns.map((run) => {
                    const duration = run.ended_at
                      ? new Date(run.ended_at).getTime() -
                        new Date(run.started_at).getTime()
                      : null

                    return (
                      <tr
                        key={run.id}
                        className="hover:bg-gray-800/50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Link
                            to={`/runs/${run.id}`}
                            className="text-indigo-400 hover:text-indigo-300 font-medium"
                          >
                            {run.agent_name}
                          </Link>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <StatusBadge status={run.status} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                          {formatDistanceToNow(new Date(run.started_at), {
                            addSuffix: true,
                          })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                          {duration ? `${Math.round(duration / 1000)}s` : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                          {run.external_id || '-'}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
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
