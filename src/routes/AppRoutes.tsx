// src/AppRoutes.tsx
import React, { useEffect } from "react"; // Importa useEffect
import { Routes, Route, Navigate } from "react-router-dom";
import useAuthStore from "@/store/authStore";
import LoginPage from "@/pages/auth/LoginPage";
import ForgotPasswordPage from "@/pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "@/pages/auth/ResetPasswordPage";
import Layout from "@/components/layout/layout";
import PatientsPage from "@/pages/patients/PatientsPage";
import PatientDetailsPage from "@/pages/patients/PatientDetailsPage";
import AppointmentsPage from "@/pages/appointments/AppointmentsPage";
import ProfilePage from "@/pages/user/ProfilePage";
import SettingsPage from "@/pages/user/SettingsPage";
import ScheduleAppointmentPage from "@/pages/appointments/ScheduleAppointmentPage";

// Componente PrivateRoute: Protege las rutas que requieren autenticación
const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { isAuthenticated, isLoading } = useAuthStore();

  // Muestra un mensaje de carga mientras se verifica la autenticación
  // Esto es útil si se accede directamente a una ruta protegida sin pasar por la raíz
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-xl">Cargando contenido...</p>
      </div>
    );
  }

  // Si está autenticado, muestra el contenido; de lo contrario, redirige al login
  return isAuthenticated ? <>{children}</> : <Navigate to="/inicio-sesion" replace />;
};

const AppRoutes: React.FC = () => {
  // Obtiene el estado de autenticación y la función de inicialización del store
  const { isAuthenticated, isLoading, initializeAuth } = useAuthStore();

  // Llama a initializeAuth una vez cuando el componente se monta
  // Esto verifica si hay un token activo y carga los datos del usuario
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]); // Dependencia: initializeAuth para que se ejecute solo una vez

  // Si la aplicación aún está cargando el estado de autenticación,
  // muestra un indicador de carga global para evitar parpadeos del login
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-xl">Cargando sesión inicial...</p>
      </div>
    );
  }

  return (
    <Routes>
      {/*
        Ruta raíz ("/"): Ahora es condicional.
        Si el usuario está autenticado (isAuthenticated es true),
        redirige a "/pacientes".
        De lo contrario, muestra el componente LoginPage.
      */}
      <Route
        path="/"
        element={isAuthenticated ? <Navigate to="/pacientes" replace /> : <LoginPage />}
      />
      {/* Ruta explícita para el inicio de sesión */}
      <Route path="/inicio-sesion" element={<LoginPage />} />
      <Route path="/olvide-contrasena" element={<ForgotPasswordPage />} />
      <Route
        path="/restablecer-contrasena/:token"
        element={<ResetPasswordPage />}
      />

      {/* Rutas Protegidas: Envueltas en PrivateRoute */}
      <Route
        path="/perfil"
        element={
          <Layout>
            <PrivateRoute>
              <ProfilePage />
            </PrivateRoute>
          </Layout>
        }
      />
      <Route
        path="/reserva"
        element={
          <Layout>
            <PrivateRoute>
              <ScheduleAppointmentPage />
            </PrivateRoute>
          </Layout>
        }
      />
      <Route
        path="/ajustes"
        element={
          <Layout>
            <PrivateRoute>
              <SettingsPage />
            </PrivateRoute>
          </Layout>
        }
      />
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
      <Route
        path="/citas"
        element={
          <Layout>
            <PrivateRoute>
              <AppointmentsPage />
            </PrivateRoute>
          </Layout>
        }
      />
      {/* Ruta para cualquier otra URL no encontrada */}
      <Route path="*" element={<div>404 - Página no encontrada</div>} />
    </Routes>
  );
};

export default AppRoutes;