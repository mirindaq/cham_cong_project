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
import PartTime from "@/pages/employee/PartTime";
import LeaveRequestApprovalPage from "@/pages/admin/LeaveRequestApprovalPage";
import ComplaintApprovalPage from "@/pages/admin/ComplaintApprovalPage";
import PartTimeRequestApprovalPage from "@/pages/admin/PartTimeRequestApprovalPage";
import RevertLeaveRequestApprovalPage from "@/pages/admin/RevertLeaveRequestApprovalPage";
import ShiftChangeRequests from "@/pages/employee/ShiftChangeRequests";
import ShiftChangeRequestApprovalPage from "@/pages/admin/ShiftChangeRequestApprovalPage";
import AdminNews from "@/pages/admin/AdminNews";
import News from "@/pages/employee/News";
import NewsDetail from "@/pages/employee/NewsDetail";
import RemoteWorkRequest from "@/pages/employee/RemoteWorkRequest";
import RemoteWorkRequestApprovalPage from "@/pages/admin/RemoteWorkRequestApprovalPage";
import StatisticPersonal from "@/pages/employee/StatisticPersonal";

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
      {
        path: "part-time",
        element: (
          <ProtectedRoute allowedRoles={["EMPLOYEE"]}>
            <PartTime />
          </ProtectedRoute>
        ),
      },
      {
        path: "shift-change-requests",
        element: (
          <ProtectedRoute allowedRoles={["EMPLOYEE"]}>
            <ShiftChangeRequests />
          </ProtectedRoute>
        ),
      },
      {
        path: "news",
        element: (
          <ProtectedRoute allowedRoles={["EMPLOYEE"]}>
            <News />
          </ProtectedRoute>
        ),
      },
      {
        path: "news/:slug",
        element: (
          <ProtectedRoute allowedRoles={["EMPLOYEE"]}>
            <NewsDetail />
          </ProtectedRoute>
        ),
      },
      {
        path: "remote-work-requests",
        element: (
          <ProtectedRoute allowedRoles={["EMPLOYEE"]}>
            <RemoteWorkRequest />
          </ProtectedRoute>
        ),
      },
      {
        path: "statistic-personal",
        element: (
          <ProtectedRoute allowedRoles={["EMPLOYEE"]}>
            <StatisticPersonal />
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
        path: "news",
        element: (
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <AdminNews />
          </ProtectedRoute>
        ),
      },
      {
        path: "complaint-approvals",
        element: (
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <ComplaintApprovalPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "leave-approvals",
        element: (
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <LeaveRequestApprovalPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "part-time-approvals",
        element: (
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <PartTimeRequestApprovalPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "revert-leave-approvals",
        element: (
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <RevertLeaveRequestApprovalPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "shift-change-approvals",
        element: (
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <ShiftChangeRequestApprovalPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "remote-work-approvals",
        element: (
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <RemoteWorkRequestApprovalPage />
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
