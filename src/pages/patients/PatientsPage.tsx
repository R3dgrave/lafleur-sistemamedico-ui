import React from "react";
import useAuthStore from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import api from "@/lib/api";
import { toast } from "react-toastify";

const PatientsPage: React.FC = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await api.post("/autenticacion/cerrar-sesion");
      logout();
      toast.success("Sesión cerrada exitosamente.");
      navigate("/");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      toast.error("Ocurrió un error al intentar cerrar la sesión.");
      logout();
      navigate("/");
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-4">
      <h1 className="text-4xl font-bold mb-4">Página de Pacientes</h1>
      {user && <p className="text-lg mb-8">Bienvenido, {user.email}!</p>}

      <div className="mt-8">
        <p className="text-md">Aquí se mostrarán los datos de los pacientes.</p>
        <ul className="mt-4 list-disc list-inside">
          <li>Paciente 1: Juan Pérez</li>
          <li>Paciente 2: María García</li>
          <li>Paciente 3: Pedro López</li>
        </ul>
      </div>

      <div className="mt-12">
        <Button onClick={handleLogout} className="px-6 py-3 text-lg">
          Cerrar Sesión
        </Button>
      </div>
    </div>
  );
};

export default PatientsPage;
