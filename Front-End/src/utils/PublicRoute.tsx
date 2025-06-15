import { Navigate } from 'react-router';
import { useAuth } from '@/contexts/AuthContext';
import { localStorageUtil } from './localStorageUtil';


interface PublicRouteProps {
  children: React.ReactNode;
}

const PublicRoute = ({ children }: PublicRouteProps) => {
  const {  role } = useAuth();
  const accessToken = localStorageUtil.getAccessTokenFromLocalStorage();
  if (accessToken) {
    if (role == 'ADMIN') {
      return <Navigate to="/admin/dashboard" replace />;
    } else if (role ==='EMPLOYEE') {
      return <Navigate to="/employee/dashboard" replace />;
    }
  }

  return <>{children}</>;
};

export default PublicRoute; 