// src/hooks/clinicalHistory/usePhysicalExamination.ts
import { useClinicalSection } from "./useClinicalSection";
import { clinicalHistoryService } from "@/services/clinicalHistoryService";
import type { ExploracionFisica, CreateExploracionFisicaData, UpdateExploracionFisicaData } from "@/types";

export const usePhysicalExamination = (historiaClinicaId: number | undefined) => {
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
  } = useClinicalSection<ExploracionFisica, CreateExploracionFisicaData, UpdateExploracionFisicaData>(
    "exploracionFisica",
    historiaClinicaId,
    {
      fetchFn: clinicalHistoryService.getExploracionFisicaByHistoriaClinicaId,
      createFn: clinicalHistoryService.createExploracionFisica,
      updateFn: clinicalHistoryService.updateExploracionFisica,
      deleteFn: clinicalHistoryService.deleteExploracionFisica,
    },
    "exploracion_id"
  );

  return {
    exploracionRecords: records,
    isLoadingExploracion: isLoading,
    isErrorExploracion: isError,
    exploracionError: error,
    isExploracionFormOpen: isFormOpen,
    editingExploracion: editingRecord,
    isSavingExploracion: isSaving,
    handleOpenExploracionForm: handleOpenForm,
    handleCloseExploracionForm: handleCloseForm,
    handleSubmitExploracionForm: handleSubmitForm,
    handleDeleteExploracion: handleDelete,
  };
};