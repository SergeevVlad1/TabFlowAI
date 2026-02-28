import { useState } from 'react';
import { Layout } from './components/Layout/Layout';
import { Dashboard } from './pages/Dashboard/Dashboard';
import { TasksPage } from './pages/Tasks/TasksPage';
import { StatsPage } from './pages/Stats/StatsPage';
import './global.scss';

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
