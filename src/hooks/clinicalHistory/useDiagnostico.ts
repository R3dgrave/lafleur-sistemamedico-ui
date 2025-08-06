// src/hooks/clinicalHistory/useDiagnostico.ts
import { useClinicalSection } from "./useClinicalSection";
import { clinicalHistoryService } from "@/services/clinicalHistoryService";
import type { Diagnostico, CreateDiagnosticoData, UpdateDiagnosticoData } from "@/types";

export const useDiagnostico = (historiaClinicaId: number | undefined) => {
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
  } = useClinicalSection<Diagnostico, CreateDiagnosticoData, UpdateDiagnosticoData>(
    "diagnosticos",
    historiaClinicaId,
    {
      fetchFn: clinicalHistoryService.getDiagnosticosByHistoriaClinicaId,
      createFn: (id, data) => clinicalHistoryService.createDiagnostico(id, data),
      updateFn: (id, data) => clinicalHistoryService.updateDiagnostico(id, data),
      deleteFn: clinicalHistoryService.deleteDiagnostico,
    },
    "diagnostico_id"
  );

  return {
    diagnosticoRecords: records,
    isLoadingDiagnostico: isLoading,
    isErrorDiagnostico: isError,
    diagnosticoError: error,
    isDiagnosticoFormOpen: isFormOpen,
    editingDiagnostico: editingRecord,
    isSavingDiagnostico: isSaving,
    handleOpenDiagnosticoForm: handleOpenForm,
    handleCloseDiagnosticoForm: handleCloseForm,
    handleSubmitDiagnosticoForm: handleSubmitForm,
    handleDeleteDiagnostico: handleDelete,
  };
};