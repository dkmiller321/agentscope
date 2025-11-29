import { LayoutDashboard, Play, FlaskConical, Box, Settings, ChevronDown, User } from 'lucide-react';

interface SidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
}

export function Sidebar({ currentView, onNavigate }: SidebarProps) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'runs', label: 'Runs', icon: Play },
    { id: 'tests', label: 'Tests', icon: FlaskConical },
    { id: 'mcp', label: 'MCP Inspector', icon: Box },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="w-60 bg-[#131416] border-r border-[#1F1F22] flex flex-col">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-[#1F1F22]">
        <div className="w-8 h-8 rounded-lg bg-[#4C8BFF] flex items-center justify-center">
          <span className="text-white">A</span>
        </div>
        <span className="ml-3">AgentScope</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id || 
            (item.id === 'runs' && currentView === 'run-detail') ||
            (item.id === 'tests' && currentView === 'test-detail');
          
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                isActive
                  ? 'bg-[#4C8BFF]/10 text-[#4C8BFF]'
                  : 'text-gray-400 hover:bg-[#1F1F22] hover:text-white'
              }`}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Projects Section */}
      <div className="px-3 pb-4 border-t border-[#1F1F22] pt-4">
        <div className="flex items-center justify-between px-3 py-2 text-gray-400 text-sm">
          <span>Projects</span>
          <ChevronDown size={16} />
        </div>
        <div className="space-y-1 mt-2">
          <div className="px-3 py-2 rounded-lg bg-[#4C8BFF]/10 text-[#4C8BFF] text-sm">
            Production Agent
          </div>
          <div className="px-3 py-2 rounded-lg text-gray-400 hover:bg-[#1F1F22] hover:text-white text-sm cursor-pointer">
            Staging Agent
          </div>
        </div>
      </div>

      {/* User Section */}
      <div className="px-3 pb-4 border-t border-[#1F1F22] pt-4">
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[#1F1F22] cursor-pointer">
          <div className="w-8 h-8 rounded-full bg-[#4C8BFF] flex items-center justify-center">
            <User size={16} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm">John Doe</div>
            <div className="text-xs text-gray-500 truncate">john@example.com</div>
          </div>
        </div>
      </div>
    </div>
  );
}
