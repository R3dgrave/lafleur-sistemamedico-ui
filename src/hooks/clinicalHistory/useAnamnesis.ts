// src/hooks/clinicalHistory/useAnamnesis.ts
import { useClinicalSection } from "./useClinicalSection";
import { clinicalHistoryService } from "@/services/clinicalHistoryService";
import type { Anamnesis, CreateAnamnesisData, UpdateAnamnesisData } from "@/types";

export const useAnamnesis = (historiaClinicaId: number | undefined) => {
  // Obtenemos las propiedades del hook genérico con nombres específicos.
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
  } = useClinicalSection<Anamnesis, CreateAnamnesisData, UpdateAnamnesisData>(
    "anamnesis",
    historiaClinicaId,
    {
      fetchFn: clinicalHistoryService.getAnamnesisByHistoriaClinicaId,
      createFn: clinicalHistoryService.createAnamnesis,
      updateFn: clinicalHistoryService.updateAnamnesis,
      deleteFn: clinicalHistoryService.deleteAnamnesis,
    },
    "anamnesis_id"
  );

  // Devolvemos el objeto con los nombres que el componente principal espera.
  return {
    anamnesisRecords: records,
    isLoadingAnamnesis: isLoading,
    isErrorAnamnesis: isError,
    anamnesisError: error,
    isAnamnesisFormOpen: isFormOpen,
    editingAnamnesis: editingRecord,
    isSavingAnamnesis: isSaving,
    handleOpenAnamnesisForm: handleOpenForm,
    handleCloseAnamnesisForm: handleCloseForm,
    handleSubmitAnamnesisForm: handleSubmitForm,
    handleDeleteAnamnesis: handleDelete,
  };
};
