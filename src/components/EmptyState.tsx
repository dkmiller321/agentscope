import { Inbox, Play, FlaskConical } from 'lucide-react';

interface EmptyStateProps {
  type: 'onboarding' | 'no-projects' | 'no-runs' | 'no-tests';
  onAction?: () => void;
}

export function EmptyState({ type, onAction }: EmptyStateProps) {
  const configs = {
    onboarding: {
      icon: Inbox,
      title: 'Welcome to AgentScope',
      description: 'Get started by creating your first project and monitoring your AI agents.',
      action: 'Create Project',
    },
    'no-projects': {
      icon: Inbox,
      title: 'No projects yet',
      description: 'Create your first project to start debugging and monitoring AI agents.',
      action: 'Create Project',
    },
    'no-runs': {
      icon: Play,
      title: 'No runs recorded',
      description: 'Run your agent to see execution details, timeline, and performance metrics here.',
      action: 'View Documentation',
    },
    'no-tests': {
      icon: FlaskConical,
      title: 'No tests created',
      description: 'Create tests to validate agent behavior and catch regressions early.',
      action: 'Create Test',
    },
  };

  const config = configs[type];
  const Icon = config.icon;

  return (
    <div className="h-full flex items-center justify-center p-8">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 rounded-2xl bg-[#131416] border border-[#1F1F22] flex items-center justify-center mx-auto mb-6">
          <Icon size={32} className="text-gray-400" />
        </div>
        <h2 className="text-2xl mb-3">{config.title}</h2>
        <p className="text-gray-400 mb-6">{config.description}</p>
        {onAction && (
          <button
            onClick={onAction}
            className="px-6 py-3 bg-[#4C8BFF] hover:bg-[#4C8BFF]/80 rounded-lg transition-colors"
          >
            {config.action}
          </button>
        )}
      </div>
    </div>
  );
}
