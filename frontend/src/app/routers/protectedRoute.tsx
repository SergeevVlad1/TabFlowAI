import { Navigate } from 'react-router-dom';
import { PathEnum } from './routers.types';

type Props = {
    children: React.ReactNode;
};

export const ProtectedRoute = ({ children }: Props) => {
    const token = localStorage.getItem('token');
    const hasToken = !token || token === 'undefined' || token === null
    if (hasToken) {
        return <Navigate to={PathEnum.LOGIN} replace />;
    }
    return children;
};