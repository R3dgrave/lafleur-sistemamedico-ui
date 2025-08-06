// src/hooks/clinicalHistory/useClinicalSection.ts
import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";

// Definición de tipos genéricos para que el hook sea reutilizable
type FetchFunction<T> = (id: number) => Promise<T[]>;
type CreateFunction<T, C> = (id: number, data: C) => Promise<T>;
type UpdateFunction<T, U> = (id: number, data: U) => Promise<T>;
type DeleteFunction = (id: number) => Promise<any>;

interface UseClinicalSectionResult<T> {
  records: T[] | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  isFormOpen: boolean;
  editingRecord: T | null;
  isSaving: boolean;
  handleOpenForm: (record?: T) => void;
  handleCloseForm: () => void;
  handleSubmitForm: (data: any) => void;
  handleDelete: (recordId: number) => void;
}

/**
 * Hook genérico para gestionar las secciones de la historia clínica.
 * Centraliza la lógica repetitiva de fetching, creación, actualización y eliminación.
 * @param {string} queryKeyBase - La base de la clave de la query para react-query (e.g., "anamnesis").
 * @param {number | undefined} parentId - El ID de la entidad padre (historiaClinicaId o pacienteId).
 * @param {object} service - Objeto con las funciones del servicio para interactuar con la API.
 * @param {FetchFunction} service.fetchFn - Función para obtener los registros.
 * @param {CreateFunction} service.createFn - Función para crear un nuevo registro.
 * @param {UpdateFunction} service.updateFn - Función para actualizar un registro.
 * @param {DeleteFunction} service.deleteFn - Función para eliminar un registro.
 * @returns {UseClinicalSectionResult}
 */
export const useClinicalSection = <T extends { [key: string]: any }, C, U>(
  queryKeyBase: string,
  parentId: number | undefined,
  service: {
    fetchFn: FetchFunction<T>;
    createFn: CreateFunction<T, C>;
    updateFn: UpdateFunction<T, U>;
    deleteFn: DeleteFunction;
  },
  idKey: keyof T
): UseClinicalSectionResult<T> => {
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<T | null>(null);

  const {
    data: records,
    isLoading,
    isError,
    error,
  } = useQuery<T[], Error>({
    queryKey: [queryKeyBase, parentId],
    queryFn: () => service.fetchFn(parentId!),
    enabled: !!parentId,
  });

  const createMutation = useMutation<T, Error, C>({
    mutationFn: (data) => service.createFn(parentId!, data),
    onSuccess: () => {
      toast.success(`${queryKeyBase} registrado exitosamente.`);
      queryClient.invalidateQueries({ queryKey: [queryKeyBase, parentId] });
      setIsFormOpen(false);
      setEditingRecord(null);
    },
    onError: (err) => {
      console.error(`Error al crear ${queryKeyBase}:`, err);
      toast.error(`Error al crear ${queryKeyBase}: ${err.message}`);
    },
  });

  const updateMutation = useMutation<T, Error, { id: number; data: U }>({
    mutationFn: ({ id, data }) => service.updateFn(id, data),
    onSuccess: () => {
      toast.success(`${queryKeyBase} actualizado exitosamente.`);
      queryClient.invalidateQueries({ queryKey: [queryKeyBase, parentId] });
      setIsFormOpen(false);
      setEditingRecord(null);
    },
    onError: (err) => {
      console.error(`Error al actualizar ${queryKeyBase}:`, err);
      toast.error(`Error al actualizar ${queryKeyBase}: ${err.message}`);
    },
  });

  const deleteMutation = useMutation<any, Error, number>({
    mutationFn: service.deleteFn,
    onSuccess: () => {
      toast.success(`${queryKeyBase} eliminado exitosamente.`);
      queryClient.invalidateQueries({ queryKey: [queryKeyBase, parentId] });
    },
    onError: (err) => {
      console.error(`Error al eliminar ${queryKeyBase}:`, err);
      toast.error(`Error al eliminar ${queryKeyBase}: ${err.message}`);
    },
  });

  const handleOpenForm = useCallback((record?: T) => {
    setEditingRecord(record || null);
    setIsFormOpen(true);
  }, []);

  const handleCloseForm = useCallback(() => {
    setIsFormOpen(false);
    setEditingRecord(null);
  }, []);

  const handleSubmitForm = useCallback(
    (data: any) => {
      if (!parentId) {
        toast.error(
          `No se puede guardar ${queryKeyBase} sin una entidad padre asociada.`
        );
        return;
      }

      if (editingRecord) {
        updateMutation.mutate({ id: editingRecord[idKey] as number, data });
      } else {
        createMutation.mutate(data);
      }
    },
    [
      parentId,
      editingRecord,
      createMutation,
      updateMutation,
      idKey,
      queryKeyBase,
    ]
  );

  const handleDelete = useCallback(
    (recordId: number) => {
      deleteMutation.mutate(recordId);
    },
    [deleteMutation, queryKeyBase]
  );

  const isSaving =
    createMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending;

  return {
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
  };
};
