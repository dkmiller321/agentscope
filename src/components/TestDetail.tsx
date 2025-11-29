import { ChevronLeft, ChevronRight, CheckCircle, XCircle, Play } from 'lucide-react';

interface TestDetailProps {
  testId: string;
  onBack: () => void;
}

export function TestDetail({ testId, onBack }: TestDetailProps) {
  const executions = [
    { id: '1', result: 'pass', timestamp: '2 hours ago', duration: '1.2s', runId: 'run-123' },
    { id: '2', result: 'pass', timestamp: '6 hours ago', duration: '1.4s', runId: 'run-122' },
    { id: '3', result: 'fail', timestamp: '12 hours ago', duration: '0.9s', runId: 'run-121' },
    { id: '4', result: 'pass', timestamp: '1 day ago', duration: '1.3s', runId: 'run-120' },
    { id: '5', result: 'pass', timestamp: '2 days ago', duration: '1.1s', runId: 'run-119' },
  ];

  const testCode = `// Customer Query Response Time Test
import { expect } from '@agentscope/testing';

describe('Customer Query Response', () => {
  test('should respond within 3 seconds', async () => {
    const startTime = Date.now();
    
    const response = await agent.query({
      message: 'What is the status of my order?',
      context: { userId: 'test-user-123' }
    });
    
    const duration = Date.now() - startTime;
    
    expect(duration).toBeLessThan(3000);
    expect(response).toBeDefined();
    expect(response.confidence).toBeGreaterThan(0.8);
  });
});`;

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b border-[#1F1F22] bg-[#131416] px-8 py-4">
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-3">
          <button onClick={onBack} className="hover:text-white transition-colors">
            Tests
          </button>
          <ChevronRight size={16} />
          <span className="text-white">Customer Query Response Time</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl">Customer Query Response Time</h1>
            <span className="px-2 py-1 rounded border text-xs bg-green-500/10 text-green-400 border-green-500/20">
              passing
            </span>
          </div>
          <button className="px-4 py-2 bg-[#4C8BFF] hover:bg-[#4C8BFF]/80 rounded-lg transition-colors flex items-center gap-2">
            <Play size={16} />
            <span>Run Test</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Code Viewer - Left */}
        <div className="w-1/2 border-r border-[#1F1F22] flex flex-col">
          <div className="border-b border-[#1F1F22] bg-[#131416] px-6 py-3">
            <h2>Test Code</h2>
          </div>
          <div className="flex-1 overflow-auto p-6">
            <div className="bg-[#0E0F11] border border-[#1F1F22] rounded-lg p-4">
              <pre className="text-sm text-gray-300 whitespace-pre font-mono">
                {testCode}
              </pre>
            </div>
          </div>
        </div>

        {/* Executions - Right */}
        <div className="w-1/2 flex flex-col bg-[#131416]">
          <div className="border-b border-[#1F1F22] px-6 py-3">
            <h2>Recent Executions</h2>
          </div>
          <div className="flex-1 overflow-auto p-6">
            <div className="space-y-2">
              {executions.map((execution) => (
                <div
                  key={execution.id}
                  className="p-4 bg-[#0E0F11] border border-[#1F1F22] rounded-lg hover:border-[#4C8BFF]/50 cursor-pointer transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {execution.result === 'pass' ? (
                        <CheckCircle size={16} className="text-green-400" />
                      ) : (
                        <XCircle size={16} className="text-red-400" />
                      )}
                      <span className={execution.result === 'pass' ? 'text-green-400' : 'text-red-400'}>
                        {execution.result === 'pass' ? 'Passed' : 'Failed'}
                      </span>
                    </div>
                    <span className="text-xs text-gray-400">{execution.timestamp}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Duration: {execution.duration}</span>
                    <span className="text-[#4C8BFF] hover:underline">Run {execution.runId}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
