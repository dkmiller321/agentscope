import { Plus, CheckCircle, XCircle } from 'lucide-react';

interface TestsListProps {
  onTestClick: (testId: string) => void;
}

export function TestsList({ onTestClick }: TestsListProps) {
  const tests = [
    { id: 'test-456', name: 'Customer Query Response Time', lastResult: 'pass', lastRun: '2 hours ago', assertions: 3 },
    { id: 'test-457', name: 'Data Accuracy Validation', lastResult: 'fail', lastRun: '5 hours ago', assertions: 5 },
    { id: 'test-458', name: 'Tool Call Success Rate', lastResult: 'pass', lastRun: '1 day ago', assertions: 2 },
    { id: 'test-459', name: 'Response Quality Check', lastResult: 'pass', lastRun: '1 day ago', assertions: 4 },
    { id: 'test-460', name: 'Token Usage Optimization', lastResult: 'pass', lastRun: '2 days ago', assertions: 3 },
  ];

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl">Tests</h1>
          <button className="px-4 py-2 bg-[#4C8BFF] hover:bg-[#4C8BFF]/80 rounded-lg transition-colors flex items-center gap-2">
            <Plus size={16} />
            <span>New Test</span>
          </button>
        </div>

        {/* Table */}
        <div className="bg-[#131416] border border-[#1F1F22] rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="border-b border-[#1F1F22]">
              <tr className="text-gray-400 text-sm">
                <th className="text-left px-6 py-4">Test Name</th>
                <th className="text-left px-6 py-4">Last Result</th>
                <th className="text-left px-6 py-4">Last Run</th>
                <th className="text-left px-6 py-4">Assertions</th>
              </tr>
            </thead>
            <tbody>
              {tests.map((test) => (
                <tr
                  key={test.id}
                  onClick={() => onTestClick(test.id)}
                  className="border-b border-[#1F1F22] hover:bg-[#1F1F22]/30 cursor-pointer transition-colors"
                >
                  <td className="px-6 py-4">{test.name}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {test.lastResult === 'pass' ? (
                        <>
                          <CheckCircle size={16} className="text-green-400" />
                          <span className="text-green-400">Pass</span>
                        </>
                      ) : (
                        <>
                          <XCircle size={16} className="text-red-400" />
                          <span className="text-red-400">Fail</span>
                        </>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-400 text-sm">{test.lastRun}</td>
                  <td className="px-6 py-4 text-gray-400 text-sm">{test.assertions}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
