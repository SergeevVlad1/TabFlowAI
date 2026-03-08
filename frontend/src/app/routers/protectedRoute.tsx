import { Navigate } from 'react-router-dom';
import { PathEnum } from './routers.types';
import { useEffect, useState } from 'react';
import { storage } from '../../shared/api/storage';

type Props = {
    children: React.ReactNode;
};

export const ProtectedRoute = ({ children }: Props) => {
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const token = await storage.get('token');
                setIsAuthenticated(!!token && token !== 'undefined' && token !== 'null');
            } catch (error) {
                console.error('Auth check failed:', error);
                setIsAuthenticated(false);
            } finally {
                setIsLoading(false);
            }
        };

        checkAuth();
    }, []);

    if (isLoading) {
        return <div style={{
            height: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'var(--bg-color)',
            color: 'var(--text-primary)'
        }}>Loading...</div>;
    }

    if (!isAuthenticated) {
        return <Navigate to={PathEnum.LOGIN} replace />;
    }

    return <>{children}</>;
};