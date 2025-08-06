// src/hooks/hooksPatients/usePatientFilter.ts
import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { patientService } from "@/services/patientService";
import type { Paciente } from "@/types";

interface UsePatientFiltersResult {
  rutFilter: string;
  setRutFilter: (rut: string) => void;
  filteredPatient: Paciente | null;
  rutInputError: string | null;
  handleRutFilterChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSearchByRut: () => void;
  patientsToDisplay: Paciente[] | undefined;
  isLoadingPatients: boolean;
  isErrorPatients: boolean;
  patientsError: Error | null;
  isSearchingByRut: boolean;
  allPatients: Paciente[] | undefined;
}

export const usePatientFilters = (): UsePatientFiltersResult => {
  const [rutFilter, setRutFilter] = useState("");
  const [filteredPatient, setFilteredPatient] = useState<Paciente | null>(null);
  const [rutInputError, setRutInputError] = useState<string | null>(null);

  const {
    data: allPatients,
    isLoading: isLoadingAll,
    isError: isErrorAll,
    error: errorAll,
  } = useQuery<Paciente[], Error>({
    queryKey: ["patients"],
    queryFn: patientService.getAll,
  });

  const validateRut = (rut: string): boolean => {
    const rutRegex = /^\d{1,2}\.?\d{3}\.?\d{3}-[\dkK]$/;
    return rutRegex.test(rut);
  };

  const { mutate: searchPatientByRut, isPending: isSearchingByRut } =
    useMutation<Paciente, Error, string>({
      mutationFn: patientService.getPatientByRut,
      onSuccess: (data) => {
        setFilteredPatient(data);
        setRutInputError(null);
        toast.success("Paciente encontrado exitosamente.");
      },
      onError: (err) => {
        setFilteredPatient(null);
        let errorMessage = "Error desconocido al buscar paciente.";

        if (
          (err as any).response &&
          (err as any).response.data &&
          (err as any).response.data.message
        ) {
          errorMessage = (err as any).response.data.message;
        } else if (err.message) {
          errorMessage = err.message;
        }

        setRutInputError(errorMessage);
        toast.error(`Búsqueda fallida: ${errorMessage}`);
      },
    });

  const patientsToDisplay = useMemo(() => {
    if (rutFilter && filteredPatient) {
      return [filteredPatient];
    }
    return allPatients;
  }, [rutFilter, filteredPatient, allPatients]);

  const handleRutFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setRutFilter(value);

    if (rutInputError) {
      setRutInputError(null);
    }

    if (value === "") {
      setFilteredPatient(null);
    }
  };

  const handleSearchByRut = () => {
    const trimmedRut = rutFilter.trim();

    if (trimmedRut === "") {
      setRutInputError("Por favor, ingresa un RUT para buscar.");
      setFilteredPatient(null);
      return;
    }

    if (!validateRut(trimmedRut)) {
      setRutInputError(
        "Formato de RUT incorrecto. Usa puntos y guión (Ej: 12.345.678-9)."
      );
      setFilteredPatient(null);
      toast.error("Formato de RUT inválido.");
      return;
    }

    setRutInputError(null);
    searchPatientByRut(trimmedRut);
  };

  return {
    rutFilter,
    setRutFilter,
    filteredPatient,
    rutInputError,
    handleRutFilterChange,
    handleSearchByRut,
    patientsToDisplay,
    isLoadingPatients: isLoadingAll || isSearchingByRut,
    isErrorPatients: isErrorAll,
    patientsError: errorAll,
    isSearchingByRut,
    allPatients,
  };
};
