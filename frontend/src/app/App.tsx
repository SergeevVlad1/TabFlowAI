import { useState } from 'react';
import { Layout } from '../widgets/layout';
import './styles/index.scss';
import { Routes, Route, BrowserRouter } from 'react-router-dom';
import { routers } from './routers/routers';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'tasks' | 'stats'>('dashboard');

  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Layout activeTab={activeTab} onTabChange={setActiveTab}>
          <Routes>
            {routers.map((router) => (
              <Route key={router.path} path={router.path} element={router.element} />
            ))}
          </Routes>
        </Layout>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
