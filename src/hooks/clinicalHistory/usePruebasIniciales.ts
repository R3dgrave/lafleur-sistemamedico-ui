// src/hooks/clinicalHistory/usePruebasIniciales.ts
import { useClinicalSection } from "./useClinicalSection";
import { clinicalHistoryService } from "@/services/clinicalHistoryService";
import type { PruebasIniciales, CreatePruebasInicialesData, UpdatePruebasInicialesData } from "@/types";

/**
 * Hook para gestionar los registros de Pruebas Iniciales.
 * Se usa el hook genérico useClinicalSection, pasando el pacienteId como parentId.
 */
export const usePruebasIniciales = (pacienteId: number | undefined) => {
  const {
    records,
    isLoading,
    isError,
    error,
    isFormOpen,
    editingRecord,
    isSaving,
    handleOpenForm,
    handleCloseForm,
    handleSubmitForm,
    handleDelete,
  } = useClinicalSection<PruebasIniciales, CreatePruebasInicialesData, UpdatePruebasInicialesData>(
    "pruebasIniciales",
    pacienteId,
    {
      fetchFn: clinicalHistoryService.getPruebasInicialesByPacienteId,
      createFn: (id, data) => clinicalHistoryService.createPruebasIniciales({ ...data, paciente_id: id }),
      updateFn: (id, data) => clinicalHistoryService.updatePruebasIniciales(id, data),
      deleteFn: clinicalHistoryService.deletePruebasIniciales,
    },
    "prueba_id"
  );

  return {
    pruebasInicialesRecords: records,
    isLoadingPruebasIniciales: isLoading,
    isErrorPruebasIniciales: isError,
    pruebasInicialesError: error,
    isPruebasInicialesFormOpen: isFormOpen,
    editingPruebasIniciales: editingRecord,
    isSavingPruebasIniciales: isSaving,
    handleOpenPruebasInicialesForm: handleOpenForm,
    handleClosePruebasInicialesForm: handleCloseForm,
    handleSubmitPruebasInicialesForm: handleSubmitForm,
    handleDeletePruebasIniciales: handleDelete,
  };
};