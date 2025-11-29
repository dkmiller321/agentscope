import { useState } from 'react';
import { ChevronLeft, ChevronRight, Play, SkipBack, SkipForward, User, Bot, Wrench, CheckCircle, AlertCircle } from 'lucide-react';

interface RunDetailProps {
  runId: string;
  onBack: () => void;
}

export function RunDetail({ runId, onBack }: RunDetailProps) {
  const [selectedStep, setSelectedStep] = useState(0);
  const [inspectorTab, setInspectorTab] = useState<'details' | 'metadata' | 'diff'>('details');

  const steps = [
    {
      type: 'user',
      title: 'User Message',
      content: 'Can you help me analyze the sales data from last quarter?',
      tokens: 156,
      cost: '$0.002',
      latency: '0ms',
      icon: User,
      metadata: { role: 'user', timestamp: '2025-11-28T10:30:00Z' }
    },
    {
      type: 'assistant',
      title: 'Assistant Response',
      content: 'I\'ll help you analyze the sales data. Let me fetch that information.',
      tokens: 234,
      cost: '$0.012',
      latency: '850ms',
      icon: Bot,
      metadata: { role: 'assistant', model: 'gpt-4', timestamp: '2025-11-28T10:30:01Z' }
    },
    {
      type: 'tool-call',
      title: 'Tool Call: fetch_sales_data',
      content: '{"quarter": "Q3", "year": 2024, "include_breakdown": true}',
      tokens: 45,
      cost: '$0.001',
      latency: '120ms',
      icon: Wrench,
      metadata: { tool: 'fetch_sales_data', arguments: { quarter: 'Q3', year: 2024 } }
    },
    {
      type: 'tool-result',
      title: 'Tool Result: fetch_sales_data',
      content: '{"total_revenue": 1250000, "growth": 15.3, "top_product": "Enterprise Plan"}',
      tokens: 89,
      cost: '$0.001',
      latency: '2.1s',
      icon: CheckCircle,
      metadata: { status: 'success', execution_time: '2.1s' }
    },
    {
      type: 'assistant',
      title: 'Assistant Response',
      content: 'Based on the data, Q3 showed strong performance with $1.25M revenue and 15.3% growth.',
      tokens: 312,
      cost: '$0.018',
      latency: '920ms',
      icon: Bot,
      metadata: { role: 'assistant', model: 'gpt-4', timestamp: '2025-11-28T10:30:05Z' }
    },
  ];

  const currentStep = steps[selectedStep];

  const getStepColor = (type: string) => {
    switch (type) {
      case 'user':
        return 'border-blue-500/30 bg-blue-500/5';
      case 'assistant':
        return 'border-purple-500/30 bg-purple-500/5';
      case 'tool-call':
        return 'border-yellow-500/30 bg-yellow-500/5';
      case 'tool-result':
        return 'border-green-500/30 bg-green-500/5';
      default:
        return 'border-[#1F1F22] bg-[#131416]';
    }
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case 'user':
        return 'text-blue-400 bg-blue-500/10';
      case 'assistant':
        return 'text-purple-400 bg-purple-500/10';
      case 'tool-call':
        return 'text-yellow-400 bg-yellow-500/10';
      case 'tool-result':
        return 'text-green-400 bg-green-500/10';
      default:
        return 'text-gray-400 bg-gray-500/10';
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b border-[#1F1F22] bg-[#131416] px-8 py-4">
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-3">
          <button onClick={onBack} className="hover:text-white transition-colors">
            Runs
          </button>
          <ChevronRight size={16} />
          <span className="text-white">Customer Support Query</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl">Customer Support Query</h1>
            <span className="px-2 py-1 rounded border text-xs bg-green-500/10 text-green-400 border-green-500/20">
              success
            </span>
          </div>
          <div className="flex gap-6 text-sm">
            <div>
              <span className="text-gray-400">Model:</span>{' '}
              <span>gpt-4</span>
            </div>
            <div>
              <span className="text-gray-400">Cost:</span>{' '}
              <span>$0.42</span>
            </div>
            <div>
              <span className="text-gray-400">Duration:</span>{' '}
              <span>2.3s</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Timeline - 65% */}
        <div className="w-[65%] border-r border-[#1F1F22] flex flex-col">
          {/* Replay Controls */}
          <div className="border-b border-[#1F1F22] bg-[#131416] px-6 py-3 flex items-center gap-4">
            <button
              onClick={() => setSelectedStep(Math.max(0, selectedStep - 1))}
              disabled={selectedStep === 0}
              className="p-2 rounded hover:bg-[#1F1F22] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <SkipBack size={16} />
            </button>
            <button className="p-2 rounded hover:bg-[#1F1F22] transition-colors">
              <Play size={16} />
            </button>
            <button
              onClick={() => setSelectedStep(Math.min(steps.length - 1, selectedStep + 1))}
              disabled={selectedStep === steps.length - 1}
              className="p-2 rounded hover:bg-[#1F1F22] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <SkipForward size={16} />
            </button>
            <div className="flex-1 flex items-center gap-3">
              <span className="text-sm text-gray-400">
                Step {selectedStep + 1} / {steps.length}
              </span>
              <div className="flex-1 h-1 bg-[#1F1F22] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#4C8BFF] transition-all duration-300"
                  style={{ width: `${((selectedStep + 1) / steps.length) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Steps List */}
          <div className="flex-1 overflow-auto p-6 space-y-3">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isSelected = index === selectedStep;
              return (
                <button
                  key={index}
                  onClick={() => setSelectedStep(index)}
                  className={`w-full text-left p-4 rounded-lg border transition-all ${
                    isSelected
                      ? 'border-[#4C8BFF] bg-[#4C8BFF]/5 shadow-lg'
                      : `${getStepColor(step.type)} hover:border-[#4C8BFF]/50`
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${getIconColor(step.type)}`}>
                      <Icon size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <span className="truncate">{step.title}</span>
                        <div className="flex gap-2 ml-3 flex-shrink-0">
                          <span className="text-xs px-2 py-0.5 rounded bg-[#1F1F22] text-gray-400">
                            {step.tokens}t
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded bg-[#1F1F22] text-gray-400">
                            {step.cost}
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded bg-[#1F1F22] text-gray-400">
                            {step.latency}
                          </span>
                        </div>
                      </div>
                      {isSelected && (
                        <div className="text-sm text-gray-400 mt-2 p-3 bg-[#0E0F11] rounded border border-[#1F1F22]">
                          <pre className="whitespace-pre-wrap break-words">{step.content}</pre>
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Inspector - 35% */}
        <div className="w-[35%] flex flex-col bg-[#131416]">
          {/* Inspector Tabs */}
          <div className="border-b border-[#1F1F22] flex">
            {(['details', 'metadata', 'diff'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setInspectorTab(tab)}
                className={`px-6 py-3 border-b-2 transition-colors capitalize ${
                  inspectorTab === tab
                    ? 'border-[#4C8BFF] text-[#4C8BFF]'
                    : 'border-transparent text-gray-400 hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Inspector Content */}
          <div className="flex-1 overflow-auto p-6">
            {inspectorTab === 'details' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm text-gray-400 mb-2">Content</h3>
                  <div className="bg-[#0E0F11] border border-[#1F1F22] rounded-lg p-4">
                    <pre className="text-sm text-gray-300 whitespace-pre-wrap break-words font-mono">
                      {currentStep.content}
                    </pre>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm text-gray-400 mb-2">Metadata</h3>
                  <div className="bg-[#0E0F11] border border-[#1F1F22] rounded-lg p-4">
                    <pre className="text-sm text-gray-300 whitespace-pre-wrap break-words font-mono">
                      {JSON.stringify(currentStep.metadata, null, 2)}
                    </pre>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-gray-400 mb-1">Tokens</div>
                    <div className="text-lg">{currentStep.tokens}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400 mb-1">Cost</div>
                    <div className="text-lg">{currentStep.cost}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400 mb-1">Latency</div>
                    <div className="text-lg">{currentStep.latency}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400 mb-1">Type</div>
                    <div className="text-lg capitalize">{currentStep.type}</div>
                  </div>
                </div>
              </div>
            )}
            {inspectorTab === 'metadata' && (
              <div className="bg-[#0E0F11] border border-[#1F1F22] rounded-lg p-4">
                <pre className="text-sm text-gray-300 whitespace-pre-wrap break-words font-mono">
                  {JSON.stringify({
                    step_index: selectedStep,
                    total_steps: steps.length,
                    ...currentStep.metadata,
                    performance: {
                      tokens: currentStep.tokens,
                      cost: currentStep.cost,
                      latency: currentStep.latency,
                    }
                  }, null, 2)}
                </pre>
              </div>
            )}
            {inspectorTab === 'diff' && (
              <div className="text-gray-400 text-sm">
                <p>No baseline comparison available for this run.</p>
                <p className="mt-2">Set a baseline in test configuration to enable diff view.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
