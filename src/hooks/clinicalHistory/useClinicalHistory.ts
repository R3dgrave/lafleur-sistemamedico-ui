// src/hooks/clinicalHistory/useClinicalHistory.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { clinicalHistoryService } from "@/services/clinicalHistoryService";
import type { HistoriaClinica, CreateHistoriaClinicaData } from "@/types";

interface UseClinicalHistoryResult {
  clinicalHistory: HistoriaClinica | undefined;
  isLoadingClinicalHistory: boolean;
  isErrorClinicalHistory: boolean;
  clinicalHistoryError: Error | null;
  createClinicalHistory: (pacienteId: number) => void;
  isCreatingClinicalHistory: boolean;
}

/**
 * Hook personalizado para obtener y gestionar la Historia Clínica general de un paciente.
 * Si la historia clínica no existe, proporciona una función para crearla.
 * @param {number | undefined} pacienteId - El ID del paciente para el que se busca la historia clínica.
 * @returns {UseClinicalHistoryResult}
 */
export const useClinicalHistory = (
  pacienteId: number | undefined
): UseClinicalHistoryResult => {
  const queryClient = useQueryClient();
  const {
    data: clinicalHistory,
    isLoading: isLoadingClinicalHistory,
    isError: isErrorClinicalHistory,
    error: clinicalHistoryError,
  } = useQuery<HistoriaClinica, Error>({
    queryKey: ["clinicalHistory", pacienteId],
    queryFn: () =>
      clinicalHistoryService.getHistoriaClinicaByPacienteId(pacienteId!),
    enabled: !!pacienteId,
    retry: (failureCount, error) => {
      return (error as any)?.response?.status !== 404 && failureCount < 3;
    },
  });

  const createClinicalHistoryMutation = useMutation<
    HistoriaClinica,
    Error,
    CreateHistoriaClinicaData
  >({
    mutationFn: clinicalHistoryService.createHistoriaClinica,
    onSuccess: (data) => {
      toast.success("Historia clínica creada exitosamente.");
      queryClient.invalidateQueries({
        queryKey: ["clinicalHistory", data.paciente_id],
      });
    },
    onError: (err) => {
      console.error("Error al crear historia clínica:", err);
      toast.error(`Error al crear historia clínica: ${err.message}`);
    },
  });

  const createClinicalHistory = (id: number) => {
    createClinicalHistoryMutation.mutate({ paciente_id: id });
  };

  return {
    clinicalHistory,
    isLoadingClinicalHistory,
    isErrorClinicalHistory,
    clinicalHistoryError,
    createClinicalHistory,
    isCreatingClinicalHistory: createClinicalHistoryMutation.isPending,
  };
};
