import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '../api/client'
import { useParams, Link } from 'react-router-dom'
import { format } from 'date-fns'
import { ArrowLeft, ChevronDown, ChevronRight, Clock, AlertCircle } from 'lucide-react'
import type { RunStep } from '../types'

export default function RunDetailPage() {
  const { id } = useParams<{ id: string }>()

  // Fetch run details
  const { data: run, isLoading: runLoading } = useQuery({
    queryKey: ['run', id],
    queryFn: () => api.getRun(id!),
    enabled: !!id,
  })

  // Fetch run steps
  const { data: steps = [], isLoading: stepsLoading } = useQuery({
    queryKey: ['runSteps', id],
    queryFn: () => api.getRunSteps(id!),
    enabled: !!id,
  })

  const isLoading = runLoading || stepsLoading

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Loading run details...</div>
      </div>
    )
  }

  if (!run) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="bg-gray-900 rounded-lg border border-gray-800 p-12 text-center">
          <AlertCircle className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">Run not found</h3>
          <Link
            to="/runs"
            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Back to Runs
          </Link>
        </div>
      </div>
    )
  }

  const duration = run.ended_at
    ? new Date(run.ended_at).getTime() - new Date(run.started_at).getTime()
    : null

  const totalTokens = steps.reduce((sum, step) => sum + (step.tokens_used || 0), 0)

  return (
    <div className="max-w-7xl mx-auto">
      {/* Back button */}
      <Link
        to="/runs"
        className="inline-flex items-center text-gray-400 hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Runs
      </Link>

      {/* Run Header */}
      <div className="bg-gray-900 rounded-lg border border-gray-800 p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">{run.agent_name}</h1>
            <div className="flex items-center gap-3">
              <StatusBadge status={run.status} />
              {run.external_id && (
                <span className="text-sm text-gray-400">ID: {run.external_id}</span>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div>
            <div className="text-xs text-gray-500 mb-1">Started</div>
            <div className="text-sm text-white">
              {format(new Date(run.started_at), 'MMM d, yyyy HH:mm:ss')}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">Duration</div>
            <div className="text-sm text-white">
              {duration ? `${Math.round(duration / 1000)}s` : 'Running...'}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">Steps</div>
            <div className="text-sm text-white">{steps.length}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">Total Tokens</div>
            <div className="text-sm text-white">{totalTokens.toLocaleString()}</div>
          </div>
        </div>

        {run.error && (
          <div className="bg-red-900/20 border border-red-800/50 rounded-lg p-4 mt-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="text-sm font-medium text-red-200 mb-1">Error</div>
                <pre className="text-xs text-red-300 whitespace-pre-wrap">
                  {JSON.stringify(run.error, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Steps Timeline */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4">Steps Timeline</h2>
        {steps.length === 0 ? (
          <div className="bg-gray-900 rounded-lg border border-gray-800 p-8 text-center text-gray-400">
            No steps recorded
          </div>
        ) : (
          <div className="space-y-3">
            {steps.map((step) => (
              <StepCard key={step.id} step={step} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function StepCard({ step }: { step: RunStep }) {
  const [expanded, setExpanded] = useState(false)

  const duration = step.ended_at && step.started_at
    ? new Date(step.ended_at).getTime() - new Date(step.started_at).getTime()
    : null

  return (
    <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-800/50 transition-colors"
      >
        <div className="flex items-center gap-4 flex-1">
          <div className="flex-shrink-0">
            {expanded ? (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronRight className="w-5 h-5 text-gray-400" />
            )}
          </div>
          <div className="flex items-center gap-3 flex-1">
            <span className="text-sm font-mono text-gray-500">#{step.step_index}</span>
            <StepTypeBadge type={step.step_type} />
            <span className="text-white font-medium">{step.name}</span>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-400">
            {duration && (
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{duration}ms</span>
              </div>
            )}
            {step.tokens_used !== null && (
              <span>{step.tokens_used} tokens</span>
            )}
          </div>
        </div>
      </button>

      {expanded && (
        <div className="border-t border-gray-800 p-6 space-y-4">
          {step.input && (
            <div>
              <div className="text-xs font-medium text-gray-400 mb-2">Input</div>
              <pre className="bg-gray-800 rounded p-3 text-xs text-gray-300 overflow-x-auto">
                {JSON.stringify(step.input, null, 2)}
              </pre>
            </div>
          )}

          {step.output && (
            <div>
              <div className="text-xs font-medium text-gray-400 mb-2">Output</div>
              <pre className="bg-gray-800 rounded p-3 text-xs text-gray-300 overflow-x-auto">
                {JSON.stringify(step.output, null, 2)}
              </pre>
            </div>
          )}

          {step.error && (
            <div>
              <div className="text-xs font-medium text-red-400 mb-2">Error</div>
              <pre className="bg-red-900/20 border border-red-800/50 rounded p-3 text-xs text-red-300 overflow-x-auto">
                {JSON.stringify(step.error, null, 2)}
              </pre>
            </div>
          )}

          {step.metadata && (
            <div>
              <div className="text-xs font-medium text-gray-400 mb-2">Metadata</div>
              <pre className="bg-gray-800 rounded p-3 text-xs text-gray-300 overflow-x-auto">
                {JSON.stringify(step.metadata, null, 2)}
              </pre>
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-800">
            {step.started_at && (
              <div>
                <div className="text-xs text-gray-500 mb-1">Started</div>
                <div className="text-xs text-white">
                  {format(new Date(step.started_at), 'HH:mm:ss.SSS')}
                </div>
              </div>
            )}
            {step.ended_at && (
              <div>
                <div className="text-xs text-gray-500 mb-1">Ended</div>
                <div className="text-xs text-white">
                  {format(new Date(step.ended_at), 'HH:mm:ss.SSS')}
                </div>
              </div>
            )}
            {step.latency_ms !== null && (
              <div>
                <div className="text-xs text-gray-500 mb-1">Latency</div>
                <div className="text-xs text-white">{step.latency_ms}ms</div>
              </div>
            )}
            {step.tokens_used !== null && (
              <div>
                <div className="text-xs text-gray-500 mb-1">Tokens</div>
                <div className="text-xs text-white">{step.tokens_used}</div>
              </div>
            )}
          </div>
        </div>
      )}
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

function StepTypeBadge({ type }: { type: string }) {
  const styles: Record<string, string> = {
    llm_call: 'bg-purple-600/20 text-purple-400',
    tool_call: 'bg-blue-600/20 text-blue-400',
    reasoning: 'bg-yellow-600/20 text-yellow-400',
    observation: 'bg-green-600/20 text-green-400',
  }

  const style = styles[type] || 'bg-gray-600/20 text-gray-400'

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded ${style}`}>
      {type.replace(/_/g, ' ')}
    </span>
  )
}
