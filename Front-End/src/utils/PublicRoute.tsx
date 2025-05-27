import { Navigate } from 'react-router';

interface PublicRouteProps {
  children: React.ReactNode;
}

const PublicRoute = ({ children }: PublicRouteProps) => {
  // Lấy thông tin user từ localStorage
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  // Nếu đã đăng nhập, chuyển hướng về trang dashboard tương ứng với role
  if (user.role) {
    if (user.role === 'ADMIN') {
      return <Navigate to="/admin/dashboard" replace />;
    } else if (user.role === 'EMPLOYEE') {
      return <Navigate to="/employee/dashboard" replace />;
    }
  }

  return <>{children}</>;
};

export default PublicRoute; 