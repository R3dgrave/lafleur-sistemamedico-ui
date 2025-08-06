// src/hooks/clinicalHistory/usePlanTratamiento.ts
import { useClinicalSection } from "./useClinicalSection";
import { clinicalHistoryService } from "@/services/clinicalHistoryService";
import type { PlanTratamiento, CreatePlanTratamientoData, UpdatePlanTratamientoData } from "@/types";

export const usePlanTratamiento = (historiaClinicaId: number | undefined) => {
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
  } = useClinicalSection<PlanTratamiento, CreatePlanTratamientoData, UpdatePlanTratamientoData>(
    "planTratamiento",
    historiaClinicaId,
    {
      fetchFn: clinicalHistoryService.getPlanesTratamientoByHistoriaClinicaId,
      createFn: (id, data) => clinicalHistoryService.createPlanTratamiento(id, data),
      updateFn: (id, data) => clinicalHistoryService.updatePlanTratamiento(id, data),
      deleteFn: clinicalHistoryService.deletePlanTratamiento,
    },
    "plan_id"
  );

  return {
    planTratamientoRecords: records,
    isLoadingPlanTratamiento: isLoading,
    isErrorPlanTratamiento: isError,
    planTratamientoError: error,
    isPlanTratamientoFormOpen: isFormOpen,
    editingPlanTratamiento: editingRecord,
    isSavingPlanTratamiento: isSaving,
    handleOpenPlanTratamientoForm: handleOpenForm,
    handleClosePlanTratamientoForm: handleCloseForm,
    handleSubmitPlanTratamientoForm: handleSubmitForm,
    handleDeletePlanTratamiento: handleDelete,
  };
};