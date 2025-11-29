import { Plus, Clock } from 'lucide-react';

interface DashboardProps {
  onNavigate: (view: string) => void;
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const projects = [
    { id: '1', name: 'Production Agent', lastActivity: '2 hours ago', runs: 142 },
    { id: '2', name: 'Staging Agent', lastActivity: '1 day ago', runs: 89 },
    { id: '3', name: 'Development Agent', lastActivity: '3 days ago', runs: 34 },
  ];

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl mb-2">Welcome back</h1>
          <p className="text-gray-400">Monitor and debug your AI agents</p>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <button
              key={project.id}
              onClick={() => onNavigate('runs')}
              className="bg-[#131416] border border-[#1F1F22] rounded-lg p-6 text-left hover:border-[#4C8BFF]/50 transition-colors group"
            >
              <h3 className="mb-2 group-hover:text-[#4C8BFF] transition-colors">
                {project.name}
              </h3>
              <div className="flex items-center gap-2 text-sm text-gray-400 mb-3">
                <Clock size={14} />
                <span>{project.lastActivity}</span>
              </div>
              <div className="text-sm text-gray-500">
                {project.runs} runs
              </div>
            </button>
          ))}

          {/* Create Project Card */}
          <button className="bg-[#131416] border border-[#1F1F22] border-dashed rounded-lg p-6 flex flex-col items-center justify-center hover:border-[#4C8BFF]/50 transition-colors group min-h-[160px]">
            <div className="w-12 h-12 rounded-lg bg-[#4C8BFF]/10 flex items-center justify-center mb-3 group-hover:bg-[#4C8BFF]/20 transition-colors">
              <Plus size={24} className="text-[#4C8BFF]" />
            </div>
            <span className="text-gray-400 group-hover:text-white transition-colors">
              Create Project
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
