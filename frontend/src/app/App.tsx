import { useState } from 'react';
import { Layout } from '../widgets/layout';
import './styles/index.scss';
import { Routes, Route, BrowserRouter } from 'react-router-dom';
import { routers } from './routers/routers';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PathEnum } from './routers/routers.types';
import { LoginPage } from '../pages/Auth/LoginPage';
import { RegisterPage } from '../pages/Auth/RegisterPage';
import { ProtectedRoute } from './routers/protectedRoute';

function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'tasks' | 'stats'>('dashboard');

  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Layout activeTab={activeTab} onTabChange={setActiveTab}>
          <Routes>
            <Route path={PathEnum.LOGIN} element={<LoginPage />} />
            <Route path={PathEnum.REGISTER} element={<RegisterPage />} />
            {routers.map((router) => (
              < Route key={router.path} path={router.path} element={
                <ProtectedRoute>
                  {router.element}
                </ProtectedRoute>
              } />
            ))}
          </Routes>
        </Layout>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
