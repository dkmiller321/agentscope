import { useState } from 'react';
import { Wrench, Activity, AlertTriangle } from 'lucide-react';

export function MCPInspector() {
  const [activeTab, setActiveTab] = useState<'tools' | 'calls' | 'errors'>('tools');

  const tools = [
    { name: 'fetch_sales_data', description: 'Retrieves sales data for specified time period', lastUsed: '2 min ago' },
    { name: 'send_email', description: 'Sends email to specified recipients', lastUsed: '15 min ago' },
    { name: 'analyze_sentiment', description: 'Performs sentiment analysis on text', lastUsed: '1 hour ago' },
    { name: 'generate_report', description: 'Generates PDF report from data', lastUsed: '2 hours ago' },
    { name: 'search_database', description: 'Searches internal knowledge base', lastUsed: '3 hours ago' },
  ];

  const calls = [
    { timestamp: '10:45:23', tool: 'fetch_sales_data', latency: '2.1s', status: 'success' },
    { timestamp: '10:43:12', tool: 'send_email', latency: '0.8s', status: 'success' },
    { timestamp: '10:41:05', tool: 'fetch_sales_data', latency: '1.9s', status: 'success' },
    { timestamp: '10:38:42', tool: 'analyze_sentiment', latency: '1.2s', status: 'error' },
    { timestamp: '10:35:18', tool: 'generate_report', latency: '3.4s', status: 'success' },
  ];

  const errors = [
    { tool: 'analyze_sentiment', message: 'API rate limit exceeded', timestamp: '10:38:42' },
    { tool: 'search_database', message: 'Connection timeout', timestamp: '09:12:33' },
    { tool: 'fetch_sales_data', message: 'Invalid date format', timestamp: '08:45:21' },
  ];

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b border-[#1F1F22] bg-[#131416] px-8 py-4">
        <h1 className="text-3xl">MCP Inspector</h1>
        <p className="text-gray-400 mt-1">Monitor Model Context Protocol tools and calls</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-[#1F1F22] bg-[#131416] flex">
        <button
          onClick={() => setActiveTab('tools')}
          className={`px-6 py-3 border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'tools'
              ? 'border-[#4C8BFF] text-[#4C8BFF]'
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          <Wrench size={16} />
          <span>Tools</span>
        </button>
        <button
          onClick={() => setActiveTab('calls')}
          className={`px-6 py-3 border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'calls'
              ? 'border-[#4C8BFF] text-[#4C8BFF]'
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          <Activity size={16} />
          <span>Calls</span>
        </button>
        <button
          onClick={() => setActiveTab('errors')}
          className={`px-6 py-3 border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'errors'
              ? 'border-[#4C8BFF] text-[#4C8BFF]'
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          <AlertTriangle size={16} />
          <span>Errors</span>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-8">
        <div className="max-w-7xl mx-auto">
          {activeTab === 'tools' && (
            <div className="bg-[#131416] border border-[#1F1F22] rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="border-b border-[#1F1F22]">
                  <tr className="text-gray-400 text-sm">
                    <th className="text-left px-6 py-4">Name</th>
                    <th className="text-left px-6 py-4">Description</th>
                    <th className="text-left px-6 py-4">Last Used</th>
                  </tr>
                </thead>
                <tbody>
                  {tools.map((tool) => (
                    <tr
                      key={tool.name}
                      className="border-b border-[#1F1F22] hover:bg-[#1F1F22]/30 cursor-pointer transition-colors"
                    >
                      <td className="px-6 py-4">
                        <code className="text-[#4C8BFF]">{tool.name}</code>
                      </td>
                      <td className="px-6 py-4 text-gray-400 text-sm">{tool.description}</td>
                      <td className="px-6 py-4 text-gray-400 text-sm">{tool.lastUsed}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'calls' && (
            <div className="bg-[#131416] border border-[#1F1F22] rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="border-b border-[#1F1F22]">
                  <tr className="text-gray-400 text-sm">
                    <th className="text-left px-6 py-4">Timestamp</th>
                    <th className="text-left px-6 py-4">Tool</th>
                    <th className="text-left px-6 py-4">Latency</th>
                    <th className="text-left px-6 py-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {calls.map((call, index) => (
                    <tr
                      key={index}
                      className="border-b border-[#1F1F22] hover:bg-[#1F1F22]/30 cursor-pointer transition-colors"
                    >
                      <td className="px-6 py-4 text-gray-400 text-sm">{call.timestamp}</td>
                      <td className="px-6 py-4">
                        <code className="text-[#4C8BFF]">{call.tool}</code>
                      </td>
                      <td className="px-6 py-4 text-gray-400 text-sm">{call.latency}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-block px-2 py-1 rounded border text-xs ${
                            call.status === 'success'
                              ? 'bg-green-500/10 text-green-400 border-green-500/20'
                              : 'bg-red-500/10 text-red-400 border-red-500/20'
                          }`}
                        >
                          {call.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'errors' && (
            <div className="space-y-4">
              {errors.map((error, index) => (
                <div
                  key={index}
                  className="bg-[#131416] border border-red-500/20 rounded-lg p-6 hover:border-red-500/40 cursor-pointer transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <AlertTriangle size={20} className="text-red-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <code className="text-[#4C8BFF]">{error.tool}</code>
                        <span className="text-xs text-gray-400">{error.timestamp}</span>
                      </div>
                      <p className="text-gray-300">{error.message}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
