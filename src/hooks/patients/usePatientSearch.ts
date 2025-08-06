// src/hooks/usePatientSearch.ts
import { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { patientService } from "@/services/patientService";
import type { Paciente, PacienteEnCita } from "@/types";
import type { UseFormReturn } from "react-hook-form";

interface UsePatientSearchProps {
  initialData?: {
    Paciente?: PacienteEnCita;
  };
  isEditing: boolean;
  form: UseFormReturn<any>;
  isSubmitting: boolean;
}

interface UsePatientSearchResult {
  patientSearchQuery: string;
  selectedPatientInForm: PacienteEnCita | null;
  searchedPatients: Paciente[] | undefined;
  isLoadingSearchedPatients: boolean;
  isFetchingSearchedPatients: boolean;
  handlePatientSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handlePatientSelectFromSearch: (patient: Paciente) => void;
  handleClearSelectedPatient: () => void;
  isPatientSearchDisabled: boolean;
}

/**
 * Hook personalizado para gestionar busqueda de pacientes (lo uso en AppointmentsForm)
 */
export const usePatientSearch = ({
  initialData,
  isEditing,
  form,
  isSubmitting,
}: UsePatientSearchProps): UsePatientSearchResult => {
  const [patientSearchQuery, setPatientSearchQuery] = useState<string>("");
  const [selectedPatientInForm, setSelectedPatientInForm] =
    useState<PacienteEnCita | null>(null);

  useEffect(() => {
    if (isEditing && initialData?.Paciente) {
      setSelectedPatientInForm(initialData.Paciente);
      setPatientSearchQuery(
        `${initialData.Paciente.nombre} ${
          initialData.Paciente.apellido
        } (RUT: ${initialData.Paciente.rut || "N/A"})`
      );
      form.setValue("paciente_id", initialData.Paciente.paciente_id);
    } else if (!isEditing) {
      setSelectedPatientInForm(null);
      setPatientSearchQuery("");
      form.setValue("paciente_id", undefined);
    }
  }, [initialData, isEditing, form]);

  const {
    data: searchedPatients,
    isLoading: isLoadingSearchedPatients,
    isFetching: isFetchingSearchedPatients,
  } = useQuery<Paciente[]>({
    queryKey: ["patientsSearch", patientSearchQuery],
    queryFn: () => patientService.searchPatients(patientSearchQuery),
    enabled: patientSearchQuery.length >= 3 && !isEditing,
    staleTime: 5 * 60 * 1000,
  });

  const handlePatientSearchChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setPatientSearchQuery(e.target.value);
    if (!e.target.value) {
      setSelectedPatientInForm(null);
      form.setValue("paciente_id", undefined);
      form.clearErrors("paciente_id");
    }
  };

  const handlePatientSelectFromSearch = useCallback(
    (patient: Paciente) => {
      setSelectedPatientInForm(patient);
      setPatientSearchQuery(
        `${patient.nombre} ${patient.apellido} (RUT: ${patient.rut || "N/A"})`
      );
      form.setValue("paciente_id", patient.paciente_id);
      form.clearErrors("paciente_id");
    },
    [form]
  );

  const handleClearSelectedPatient = useCallback(() => {
    setSelectedPatientInForm(null);
    setPatientSearchQuery("");
    form.setValue("paciente_id", undefined);
  }, [form]);

  const isPatientSearchDisabled = isSubmitting || isEditing;

  return {
    patientSearchQuery,
    selectedPatientInForm,
    searchedPatients,
    isLoadingSearchedPatients,
    isFetchingSearchedPatients,
    handlePatientSearchChange,
    handlePatientSelectFromSearch,
    handleClearSelectedPatient,
    isPatientSearchDisabled,
  };
};
