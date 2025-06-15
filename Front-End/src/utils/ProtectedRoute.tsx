import { Navigate } from 'react-router';
import { localStorageUtil } from './localStorageUtil';


interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const accessToken = localStorageUtil.getAccessTokenFromLocalStorage();
  const role = localStorageUtil.getRoleFromLocalStorage();
  if (!accessToken || !role || !allowedRoles.includes(role)) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute; 