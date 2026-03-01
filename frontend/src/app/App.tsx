import { useState } from 'react';
import { Layout } from '../widgets/layout';
import { Dashboard } from '../pages/dashboard';
import { TasksPage } from '../pages/tasks';
import { StatsPage } from '../pages/stats';
import './styles/index.scss';

function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'tasks' | 'stats'>('dashboard');

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
      {activeTab === 'dashboard' && <Dashboard />}
      {activeTab === 'tasks' && <TasksPage />}
      {activeTab === 'stats' && <StatsPage />}
    </Layout>
  );
}

export default App;
