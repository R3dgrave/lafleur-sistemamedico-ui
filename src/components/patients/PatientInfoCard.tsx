// src/components/patients/PatientInfoCard.tsx
import React from "react";
import { format } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Paciente } from "../../types/index";

interface PatientInfoCardProps {
  patient: Paciente;
}

const PatientInfoCard: React.FC<PatientInfoCardProps> = ({ patient }) => {
  return (
    <Card className="w-full lg:w-2/4">
      <CardHeader>
        <CardTitle className="text-2xl">
          Detalles del Paciente: {patient.nombre} {patient.apellido}
        </CardTitle>
        <CardDescription>Información completa del paciente.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <p><strong>RUT:</strong> {patient.rut || "N/A"}</p>
        <p><strong>Email:</strong> {patient.email}</p>
        <p><strong>Teléfono:</strong> {patient.telefono || "N/A"}</p>
        <p>
          <strong>Fecha de Nacimiento:</strong>{" "}
          {format(new Date(patient.fecha_nacimiento), "dd/MM/yyyy")}
        </p>
        <p><strong>Género:</strong> {patient.genero}</p>
        <p><strong>Identidad de Género:</strong> {patient.identidad_genero || "N/A"}</p>
        <p><strong>Sexo Registral:</strong> {patient.sexo_registral || "N/A"}</p>
        <p className="md:col-span-2"><strong>Dirección:</strong> {patient.direccion || "N/A"}</p>
        <p className="md:col-span-2 text-sm text-gray-500">
          Registrado el:{" "}
          {format(new Date(patient.fecha_registro), "dd/MM/yyyy HH:mm")}
        </p>
      </CardContent>
    </Card>
  );
};

export default PatientInfoCard;
