import { Plus, Eye, EyeOff, ToggleLeft, ToggleRight } from 'lucide-react';
import { useState } from 'react';

export function Settings() {
  const [showApiKey, setShowApiKey] = useState(false);
  const [breakpoints, setBreakpoints] = useState([
    { id: '1', name: 'High Token Usage', condition: 'tokens > 1000', enabled: true },
    { id: '2', name: 'Tool Call Error', condition: 'tool.status == "error"', enabled: true },
    { id: '3', name: 'Long Latency', condition: 'latency > 5s', enabled: false },
  ]);

  const toggleBreakpoint = (id: string) => {
    setBreakpoints(breakpoints.map(bp => 
      bp.id === id ? { ...bp, enabled: !bp.enabled } : bp
    ));
  };

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl mb-2">Project Settings</h1>
          <p className="text-gray-400">Configure your project and debugging preferences</p>
        </div>

        {/* Project Info */}
        <section className="mb-8">
          <h2 className="text-xl mb-4">Project Information</h2>
          <div className="bg-[#131416] border border-[#1F1F22] rounded-lg p-6 space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Project Name</label>
              <input
                type="text"
                defaultValue="Production Agent"
                className="w-full px-4 py-2 bg-[#0E0F11] border border-[#1F1F22] rounded-lg focus:outline-none focus:border-[#4C8BFF] transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Description</label>
              <textarea
                defaultValue="Main production agent for customer support"
                rows={3}
                className="w-full px-4 py-2 bg-[#0E0F11] border border-[#1F1F22] rounded-lg focus:outline-none focus:border-[#4C8BFF] transition-colors resize-none"
              />
            </div>
          </div>
        </section>

        {/* API Keys */}
        <section className="mb-8">
          <h2 className="text-xl mb-4">API Keys</h2>
          <div className="bg-[#131416] border border-[#1F1F22] rounded-lg p-6 space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm text-gray-400">API Key</label>
                <button
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="text-sm text-[#4C8BFF] hover:text-[#4C8BFF]/80 transition-colors flex items-center gap-1"
                >
                  {showApiKey ? (
                    <>
                      <EyeOff size={14} />
                      <span>Hide</span>
                    </>
                  ) : (
                    <>
                      <Eye size={14} />
                      <span>Show</span>
                    </>
                  )}
                </button>
              </div>
              <div className="flex gap-2">
                <input
                  type={showApiKey ? 'text' : 'password'}
                  defaultValue="sk-proj-abc123xyz789"
                  readOnly
                  className="flex-1 px-4 py-2 bg-[#0E0F11] border border-[#1F1F22] rounded-lg font-mono text-sm"
                />
                <button className="px-4 py-2 bg-[#4C8BFF] hover:bg-[#4C8BFF]/80 rounded-lg transition-colors">
                  Generate Key
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Breakpoints */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl">Breakpoints</h2>
            <button className="px-4 py-2 bg-[#4C8BFF] hover:bg-[#4C8BFF]/80 rounded-lg transition-colors flex items-center gap-2">
              <Plus size={16} />
              <span>Add Breakpoint</span>
            </button>
          </div>
          <div className="bg-[#131416] border border-[#1F1F22] rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="border-b border-[#1F1F22]">
                <tr className="text-gray-400 text-sm">
                  <th className="text-left px-6 py-4">Name</th>
                  <th className="text-left px-6 py-4">Condition</th>
                  <th className="text-left px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {breakpoints.map((breakpoint) => (
                  <tr key={breakpoint.id} className="border-b border-[#1F1F22]">
                    <td className="px-6 py-4">{breakpoint.name}</td>
                    <td className="px-6 py-4">
                      <code className="text-sm text-gray-400 bg-[#0E0F11] px-2 py-1 rounded">
                        {breakpoint.condition}
                      </code>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleBreakpoint(breakpoint.id)}
                        className="flex items-center gap-2 hover:text-[#4C8BFF] transition-colors"
                      >
                        {breakpoint.enabled ? (
                          <>
                            <ToggleRight size={20} className="text-[#4C8BFF]" />
                            <span className="text-sm text-[#4C8BFF]">Enabled</span>
                          </>
                        ) : (
                          <>
                            <ToggleLeft size={20} className="text-gray-500" />
                            <span className="text-sm text-gray-500">Disabled</span>
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
