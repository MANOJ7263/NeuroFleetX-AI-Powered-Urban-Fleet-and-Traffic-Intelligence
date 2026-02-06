import { Routes, Route, Navigate } from "react-router-dom";

import WelcomePage from "../pages/WelcomePage";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";

import AdminDashboard from "../pages/admin/AdminDashboard";
import ManagerDashboard from "../pages/manager/ManagerDashboard";
import DriverDashboard from "../pages/driver/DriverDashboard";
import CustomerDashboard from "../pages/customer/CustomerDashboard";
import NavigationPage from "../pages/driver/NavigationPage";

import ProtectedRoute from "../components/common/ProtectedRoute";


import MainLayout from "../components/layout/MainLayout";
import ProfilePage from "../pages/ProfilePage";

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<WelcomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Protected with Sidebar Layout */}
      <Route element={<MainLayout />}>
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute role="ADMIN">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/manager/dashboard"
          element={
            <ProtectedRoute role="MANAGER">
              <ManagerDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/driver/dashboard"
          element={
            <ProtectedRoute role="DRIVER">
              <DriverDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/driver/navigation"
          element={
            <ProtectedRoute role="DRIVER">
              <NavigationPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/customer/dashboard"
          element={
            <ProtectedRoute role="CUSTOMER">
              <CustomerDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default AppRoutes;
