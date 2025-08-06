// src/pages/patients/PatientDetailsPage.tsx
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeftIcon, Loader2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { patientService } from "@/services/patientService";
import type { Paciente } from "@/types";
import PatientInfoCard from "@/components/patients/PatientInfoCard";
import EmergencyContactsSection from "@/components/patients/contactEmergency/EmergencyContactsSection";
import MedicalHistorySection from "@/components/patients/clinicalHistory/MedicalHistorySection";

const PatientDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const pacienteId = id ? parseInt(id) : undefined;
  const navigate = useNavigate();

  const {
    data: patient,
    isLoading,
    isError,
    error,
  } = useQuery<Paciente, Error>({
    queryKey: ["patient", pacienteId],
    queryFn: () => patientService.getById(pacienteId!),
    enabled: !!pacienteId,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
        <p className="ml-2 text-gray-600 dark:text-gray-400">
          Cargando detalles del paciente...
        </p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col justify-center items-center h-full min-h-[400px] text-red-500">
        <XCircle className="h-8 w-8 mb-2" />
        <p>Error al cargar paciente: {error?.message}</p>
        <Button onClick={() => navigate("/pacientes")} className="mt-4">
          Volver a la lista de pacientes
        </Button>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="flex flex-col justify-center items-center h-full min-h-[400px] text-gray-500">
        <p>Paciente no encontrado.</p>
        <Button onClick={() => navigate("/pacientes")} className="mt-4">
          Volver a la lista de pacientes
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-8">
      <Button
        variant="outline"
        onClick={() => navigate("/pacientes")}
        className="mb-6"
      >
        <ArrowLeftIcon className="mr-2 h-4 w-4" /> Volver a Pacientes
      </Button>

      <div className="w-full flex flex-col lg:flex-row gap-4 justify-between">
        <PatientInfoCard patient={patient} />

        <EmergencyContactsSection
          pacienteId={patient.paciente_id}
          patientName={`${patient.nombre} ${patient.apellido}`}
          patientRut={`${patient.rut}`}
        />
      </div>

      <MedicalHistorySection pacienteId={patient.paciente_id} />
    </div>
  );
};

export default PatientDetailsPage;
