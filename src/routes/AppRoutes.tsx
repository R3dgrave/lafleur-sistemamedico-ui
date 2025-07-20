import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import useAuthStore from "@/store/authStore";
import LoginPage from "@/pages/auth/LoginPage";
import ForgotPasswordPage from "@/pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "@/pages/auth/ResetPasswordPage";
import Layout from "@/components/layout/layout";
import PatientsPage from "@/pages/patients/PatientsPage";
import PatientDetailsPage from "@/pages/patients/PatientDetailsPage";

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-xl">Cargando sesión...</p>
      </div>
    );
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/" replace />;
};

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Rutas Públicas */}
      <Route path="/" element={<LoginPage />} />
      <Route path="/olvide-contrasena" element={<ForgotPasswordPage />} />
      <Route
        path="/restablecer-contrasena/:token"
        element={<ResetPasswordPage />}
      />

      {/* Rutas Protegidas */}
      <Route
        path="/pacientes"
        element={
          <Layout>
            <PrivateRoute>
              <PatientsPage />
            </PrivateRoute>
          </Layout>
        }
      />
      <Route
        path="/pacientes/:id"
        element={
          <Layout>
            <PrivateRoute>
              <PatientDetailsPage />
            </PrivateRoute>
          </Layout>
        }
      />
    </Routes>
  );
};

export default AppRoutes;
