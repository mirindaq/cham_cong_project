import LoginPage from "../pages/LoginPage";
import ForgotPasswordPage from "../pages/ForgotPasswordPage";
import EmployeeDashboard from "../pages/employee/Dashboard";
import EmployeeProfile from "../pages/employee/Profile";
import EmployeeLeaveRequests from "../pages/employee/LeaveRequests";
import EmployeeDisputes from "../pages/employee/Disputes";
import AdminDashboard from "../pages/admin/AdminDashboard";
import NotFoundPage from "../pages/NotFoundPage";
import LocationsPage from "../pages/admin/LocationsPage";
import ReportsPage from "../pages/admin/ReportsPage";
import ApprovalsPage from "../pages/admin/ApprovalsPage";
import DisputePage from "../pages/admin/DisputePage";
import DepartmentsPage from "../pages/admin/DepartmentsPage";
import ShiffAssignment from "../pages/admin/ShiffAssignment";
import LeaveBalancePage from "../pages/admin/LeaveBalancePage";
import AdminProfile from "../pages/admin/AdminProfile";
import UsersPage from "../pages/admin/Users";
import ChangePasswordFirstLogin from "../pages/ChangePasswordFirstLogin";
import AttendancePage from "../pages/admin/Attendance";
import ProtectedRoute from "../utils/ProtectedRoute";
import PublicRoute from "../utils/PublicRoute";

export const routes = [
  {
    path: "/",
    element: (
      <PublicRoute>
        <LoginPage />
      </PublicRoute>
    ),
  },
  {
    path: "/login",
    element: (
      <PublicRoute>
        <LoginPage />
      </PublicRoute>
    ),
  },
  {
    path: "/forgot-password",
    element: (
      <PublicRoute>
        <ForgotPasswordPage />
      </PublicRoute>
    ),
  },
  {
    path: "/change-password-first-login",
    element: (
      <PublicRoute>
        <ChangePasswordFirstLogin />
      </PublicRoute>
    ),
  },
  // Employee routes
  {
    path: "/employee",
    children: [
      {
        path: "dashboard",
        element: (
          <ProtectedRoute allowedRoles={["EMPLOYEE"]}>
            <EmployeeDashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: "profile",
        element: (
          <ProtectedRoute allowedRoles={["EMPLOYEE"]}>
            <EmployeeProfile />
          </ProtectedRoute>
        ),
      },
      {
        path: "leave-requests",
        element: (
          <ProtectedRoute allowedRoles={["EMPLOYEE"]}>
            <EmployeeLeaveRequests />
          </ProtectedRoute>
        ),
      },
      {
        path: "disputes",
        element: (
          <ProtectedRoute allowedRoles={["EMPLOYEE"]}>
            <EmployeeDisputes />
          </ProtectedRoute>
        ),
      },
    ],
  },
  // Admin routes
  {
    path: "/admin",
    children: [
      {
        path: "dashboard",
        element: (
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <AdminDashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: "users",
        element: (
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <UsersPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "attendances",
        element: (
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <AttendancePage />
          </ProtectedRoute>
        ),
      },
      {
        path: "departments",
        element: (
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <DepartmentsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "locations",
        element: (
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <LocationsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "reports",
        element: (
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <ReportsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "approvals",
        element: (
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <ApprovalsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "shiff-assignment",
        element: (
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <ShiffAssignment />
          </ProtectedRoute>
        ),
      },
      {
        path: "disputes",
        element: (
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <DisputePage />
          </ProtectedRoute>
        ),
      },
      {
        path: "leave-balance",
        element: (
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <LeaveBalancePage />
          </ProtectedRoute>
        ),
      },
      {
        path: "profile",
        element: (
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <AdminProfile />
          </ProtectedRoute>
        ),
      },
    ],
  },
  // Fallback routes
  {
    path: "/404",
    element: <NotFoundPage />,
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
]; 