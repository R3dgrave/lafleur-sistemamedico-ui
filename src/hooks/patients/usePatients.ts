import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { AxiosError } from "axios";
import { patientService } from "@/services/patientService";
import type {
  Paciente,
  CreatePacienteFormValues,
  UpdatePacienteFormValues,
  BackendError,
} from "@/types";

/**
 * Hook personalizado para gestionar todas las operaciones de pacientes con react-query.
 * @param rutFilter El filtro de búsqueda para pacientes.
 * @returns Un objeto con los datos, estados de carga/error y funciones de mutación.
 */
export const usePatients = (rutFilter: string) => {
  const queryClient = useQueryClient();

  /**
   * Esta función procesa los errores y devuelve los errores de campo.
   * La responsabilidad de mostrar los toasts se ha movido a la componente que la llama.
   */
  const handleBackendError = (err: any): BackendError[] | undefined => {
    if (err instanceof AxiosError && err.response && err.response.data) {
      if (err.response.data.errors) {
        return err.response.data.errors;
      }
      if (err.response.status === 409) {
        const message = err.response.data.message || "El email o RUT ya está registrado por otro paciente.";
        return [
          { path: ["email"], message: message },
          { path: ["rut"], message: message },
        ];
      }
    }
    return undefined;
  };

  /**
   * Consulta principal para obtener y filtrar la lista de pacientes.
   */
  const {
    data: patients,
    isLoading,
    isError,
    error,
    isFetching,
  } = useQuery<Paciente[], AxiosError>({
    queryKey: ["patients", rutFilter],
    queryFn: () => {
      if (rutFilter.trim().length >= 3) {
        return patientService.searchPatients(rutFilter);
      }
      if (rutFilter.trim() === "") {
        return patientService.getAll();
      }
      return Promise.resolve([]);
    },
    staleTime: 5 * 60 * 1000,
  });

  const createPatientMutation = useMutation<
    Paciente,
    AxiosError,
    CreatePacienteFormValues
  >({
    mutationFn: patientService.create,
  });

  const updatePatientMutation = useMutation<
    Paciente,
    AxiosError,
    { id: number; data: UpdatePacienteFormValues }
  >({
    mutationFn: ({ id, data }) => patientService.update(id, data),
  });

  const deletePatientMutation = useMutation<any, Error, number>({
    mutationFn: patientService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      toast.success("Paciente eliminado exitosamente.");
    },
    onError: (err) => {
      toast.error(`Error al eliminar paciente: ${err.message}`);
    },
  });

  return {
    patients,
    isLoading,
    isFetching,
    isError,
    error,
    createPatientMutation,
    updatePatientMutation,
    deletePatientMutation,
    handleBackendError,
  };
};
