import { Filter, Calendar } from 'lucide-react';

interface RunsListProps {
  onRunClick: (runId: string) => void;
}

export function RunsList({ onRunClick }: RunsListProps) {
  const runs = [
    { id: 'run-123', name: 'Customer Support Query', status: 'success', model: 'gpt-4', cost: '$0.42', duration: '2.3s', createdAt: '2 min ago' },
    { id: 'run-124', name: 'Data Analysis Request', status: 'error', model: 'gpt-4', cost: '$0.38', duration: '1.8s', createdAt: '15 min ago' },
    { id: 'run-125', name: 'Code Generation Task', status: 'success', model: 'gpt-4-turbo', cost: '$0.89', duration: '4.1s', createdAt: '1 hour ago' },
    { id: 'run-126', name: 'Email Draft Assistant', status: 'success', model: 'gpt-3.5-turbo', cost: '$0.12', duration: '0.9s', createdAt: '2 hours ago' },
    { id: 'run-127', name: 'Research Summarization', status: 'running', model: 'gpt-4', cost: '$0.31', duration: '1.5s', createdAt: '3 hours ago' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'error':
        return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'running':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      default:
        return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl">Runs</h1>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-[#131416] border border-[#1F1F22] rounded-lg hover:border-[#4C8BFF]/50 transition-colors flex items-center gap-2">
              <Calendar size={16} />
              <span>Date Range</span>
            </button>
            <button className="px-4 py-2 bg-[#131416] border border-[#1F1F22] rounded-lg hover:border-[#4C8BFF]/50 transition-colors flex items-center gap-2">
              <Filter size={16} />
              <span>Filters</span>
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-[#131416] border border-[#1F1F22] rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="border-b border-[#1F1F22]">
              <tr className="text-gray-400 text-sm">
                <th className="text-left px-6 py-4">Run Name</th>
                <th className="text-left px-6 py-4">Status</th>
                <th className="text-left px-6 py-4">Model</th>
                <th className="text-left px-6 py-4">Cost</th>
                <th className="text-left px-6 py-4">Duration</th>
                <th className="text-left px-6 py-4">Created</th>
              </tr>
            </thead>
            <tbody>
              {runs.map((run) => (
                <tr
                  key={run.id}
                  onClick={() => onRunClick(run.id)}
                  className="border-b border-[#1F1F22] hover:bg-[#1F1F22]/30 cursor-pointer transition-colors"
                >
                  <td className="px-6 py-4">{run.name}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-block px-2 py-1 rounded border text-xs ${getStatusColor(run.status)}`}>
                      {run.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-400 text-sm">{run.model}</td>
                  <td className="px-6 py-4 text-gray-400 text-sm">{run.cost}</td>
                  <td className="px-6 py-4 text-gray-400 text-sm">{run.duration}</td>
                  <td className="px-6 py-4 text-gray-400 text-sm">{run.createdAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
