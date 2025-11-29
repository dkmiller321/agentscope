import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { RunsList } from './components/RunsList';
import { RunDetail } from './components/RunDetail';
import { TestsList } from './components/TestsList';
import { TestDetail } from './components/TestDetail';
import { MCPInspector } from './components/MCPInspector';
import { Settings } from './components/Settings';
import { EmptyState } from './components/EmptyState';

type View = 'dashboard' | 'runs' | 'run-detail' | 'tests' | 'test-detail' | 'mcp' | 'settings' | 'onboarding';

export default function App() {
  const [currentView, setCurrentView] = useState<View>('run-detail');
  const [selectedRunId, setSelectedRunId] = useState<string>('run-123');
  const [selectedTestId, setSelectedTestId] = useState<string>('test-456');

  const handleRunClick = (runId: string) => {
    setSelectedRunId(runId);
    setCurrentView('run-detail');
  };

  const handleTestClick = (testId: string) => {
    setSelectedTestId(testId);
    setCurrentView('test-detail');
  };

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard onNavigate={setCurrentView} />;
      case 'runs':
        return <RunsList onRunClick={handleRunClick} />;
      case 'run-detail':
        return <RunDetail runId={selectedRunId} onBack={() => setCurrentView('runs')} />;
      case 'tests':
        return <TestsList onTestClick={handleTestClick} />;
      case 'test-detail':
        return <TestDetail testId={selectedTestId} onBack={() => setCurrentView('tests')} />;
      case 'mcp':
        return <MCPInspector />;
      case 'settings':
        return <Settings />;
      case 'onboarding':
        return <EmptyState type="onboarding" onAction={() => setCurrentView('dashboard')} />;
      default:
        return <Dashboard onNavigate={setCurrentView} />;
    }
  };

  return (
    <div className="flex h-screen bg-[#0E0F11] text-white">
      <Sidebar currentView={currentView} onNavigate={setCurrentView} />
      <main className="flex-1 overflow-auto">
        {renderView()}
      </main>
    </div>
  );
}
