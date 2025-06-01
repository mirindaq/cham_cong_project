import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router";
import { ThemeProvider } from "./components/theme-provider";
import ProtectedRoute from "./utils/ProtectedRoute";
import PublicRoute from "./utils/PublicRoute";
import LoginPage from "./pages/LoginPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import EmployeeDashboard from "./pages/employee/Dashboard";
import EmployeeProfile from "./pages/employee/Profile";
import EmployeeLeaveRequests from "./pages/employee/LeaveRequests";
import EmployeeDisputes from "./pages/employee/Disputes";
import AdminDashboard from "./pages/admin/AdminDashboard";
import NotFoundPage from "./pages/NotFoundPage";
import "./index.css";
import LocationsPage from "./pages/admin/LocationsPage";
import ReportsPage from "./pages/admin/ReportsPage";
import ApprovalsPage from "./pages/admin/ApprovalsPage";
import SettingsPage from "./pages/admin/SettingsPage";
import DisputePage from "./pages/admin/DisputePage";
import DepartmentsPage from "./pages/admin/DepartmentsPage";
import ShiffAssignment from "./pages/admin/ShiffAssignment";
import LeaveBalancePage from "./pages/admin/LeaveBalancePage";
import AdminProfile from "./pages/admin/AdminProfile";
import UsersPage from "./pages/admin/Users";
import ChangePasswordFirstLogin from "./pages/ChangePasswordFirstLogin";
import AttendancePage from "./pages/admin/Attendance";

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="attendance-theme">
      <Router>
        <Routes>
          {/* Public routes */}
          <Route
            path="/"
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            }
          />
          <Route
            path="/login"
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            }
          />
          <Route
            path="/forgot-password"
            element={
              <PublicRoute>
                <ForgotPasswordPage />
              </PublicRoute>
            }
          />
          <Route
            path="/change-password-first-login"
            element={
              <PublicRoute>
                <ChangePasswordFirstLogin />
              </PublicRoute>
            }
          />

          {/* Employee routes */}
          <Route
            path="/employee/dashboard"
            element={
              <ProtectedRoute allowedRoles={["EMPLOYEE"]}>
                <EmployeeDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/employee/profile"
            element={
              <ProtectedRoute allowedRoles={["EMPLOYEE"]}>
                <EmployeeProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/employee/leave-requests"
            element={
              <ProtectedRoute allowedRoles={["EMPLOYEE"]}>
                <EmployeeLeaveRequests />
              </ProtectedRoute>
            }
          />
          <Route
            path="/employee/disputes"
            element={
              <ProtectedRoute allowedRoles={["EMPLOYEE"]}>
                <EmployeeDisputes />
              </ProtectedRoute>
            }
          />

          {/* Admin routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <UsersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/attendances"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <AttendancePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/departments"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <DepartmentsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/locations"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <LocationsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/reports"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <ReportsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/approvals"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <ApprovalsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/shiff-assignment"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <ShiffAssignment />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/settings"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <SettingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/disputes"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <DisputePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/leave-balance"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <LeaveBalancePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/profile"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <AdminProfile />
              </ProtectedRoute>
            }
          />

          {/* Fallback routes */}
          <Route path="/404" element={<NotFoundPage />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
