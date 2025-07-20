import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Loader2, PlusIcon, EditIcon, Trash2Icon, EyeIcon } from "lucide-react";

import { patientService } from "@/services/patientService";
import type {
  Paciente,
  CreatePacienteFormValues,
  UpdatePacienteFormValues,
} from "../../types/index";

import PatientForm from "@/components/patientsForms/PatientForm";
import { format } from "date-fns";

const PatientsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Paciente | null>(null);

  const [rutFilter, setRutFilter] = useState("");
  const [filteredPatient, setFilteredPatient] = useState<Paciente | null>(null);
  const [rutInputError, setRutInputError] = useState<string | null>(null);

  // Query para obtener todos los pacientes
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
    const rutRegex = /^\d{1,2}\.\d{3}\.\d{3}-[\dkK]$|^(\d{7,8})-[\dkK]$/; // Acepta 12.345.678-9
    return rutRegex.test(rut);
  };

  // Query para buscar paciente por RUT (se habilita solo si hay un RUT en el input)
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

        if ((err as any).response && (err as any).response.data && (err as any).response.data.message) {
          errorMessage = (err as any).response.data.message;
        } else if (err.message) {
          errorMessage = err.message;
        }

        setRutInputError(errorMessage);
        toast.error(`Búsqueda fallida: ${errorMessage}`);
      },
    });

  const patientsToDisplay =
    rutFilter && filteredPatient ? [filteredPatient] : allPatients;
  const isLoading = isLoadingAll || isSearchingByRut;
  const isError = isErrorAll;

  const createPatientMutation = useMutation<
    Paciente,
    Error,
    CreatePacienteFormValues
  >({
    mutationFn: patientService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      toast.success("Paciente creado exitosamente.");
      setIsCreateModalOpen(false);
    },
    onError: (err) => {
      console.error("Error al crear paciente:", err);
      toast.error(`Error al crear paciente: ${err.message}`);
    },
  });

  const updatePatientMutation = useMutation<
    Paciente,
    Error,
    { id: number; data: UpdatePacienteFormValues }
  >({
    mutationFn: ({ id, data }) => patientService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      toast.success("Paciente actualizado exitosamente.");
      setEditingPatient(null); // Cierra el modal de edición
    },
    onError: (err) => {
      console.error("Error al actualizar paciente:", err);
      toast.error(`Error al actualizar paciente: ${err.message}`);
    },
  });

  const deletePatientMutation = useMutation<any, Error, number>({
    mutationFn: patientService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      toast.success("Paciente eliminado exitosamente.");
    },
    onError: (err) => {
      console.error("Error al eliminar paciente:", err);
      toast.error(`Error al eliminar paciente: ${err.message}`);
    },
  });

  const handleCreatePatient = (
    data: CreatePacienteFormValues | UpdatePacienteFormValues
  ) => {
    createPatientMutation.mutate(data as CreatePacienteFormValues);
  };

  const handleUpdatePatient = (
    data: CreatePacienteFormValues | UpdatePacienteFormValues
  ) => {
    if (editingPatient) {
      updatePatientMutation.mutate({
        id: editingPatient.paciente_id,
        data: data as UpdatePacienteFormValues,
      });
    }
  };

  const handleDeletePatient = (id: number) => {
    deletePatientMutation.mutate(id);
  };

  const handleEditClick = (patient: Paciente) => {
    setEditingPatient(patient);
  };

  const handleViewDetailsClick = (id: number) => {
    navigate(`/pacientes/${id}`);
  };

  const handleRutFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setRutFilter(value);

    if (rutInputError) {
      setRutInputError(null);
    }

    if (value === "") {
      setFilteredPatient(null);
      queryClient.invalidateQueries({ queryKey: ["patients"] });
    }
  };

  const handleSearchByRut = () => {
    const trimmedRut = rutFilter.trim();

    if (trimmedRut === "") {
      setRutInputError("Por favor, ingresa un RUT para buscar.");
      setFilteredPatient(null);
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      return;
    }

    if (!validateRut(trimmedRut)) {
      setRutInputError("Formato de RUT incorrecto. Usa puntos y guión");
      setFilteredPatient(null);
      toast.error("Formato de RUT inválido.");
      return;
    }

    setRutInputError(null);
    searchPatientByRut(trimmedRut);
  };

  if (isLoading)
    return (
      <div className="flex min-h-screen items-center justify-center text-xl">
        <Loader2 className="mr-2 h-8 w-8 animate-spin" />
        <p>Cargando pacientes...</p>
      </div>
    );
  if (isError)
    return (
      <div className="flex min-h-screen items-center justify-center text-xl text-red-500">
        Error al cargar pacientes: {errorAll.message}
      </div>
    );

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">
        Gestión de Pacientes
      </h1>

      <div className="flex justify-end mb-4">
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusIcon className="mr-2 h-4 w-4" /> Nuevo Paciente
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Crear Nuevo Paciente</DialogTitle>
              <DialogDescription>
                Completa los datos para registrar un nuevo paciente.
              </DialogDescription>
            </DialogHeader>
            <PatientForm
              onSubmit={handleCreatePatient}
              isSubmitting={createPatientMutation.isPending}
              onCancel={() => setIsCreateModalOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Input de filtro por RUT y botón de búsqueda */}
      <div className="mb-6">
        <div className="flex gap-2 mb-2">
          <Input
            placeholder="Filtrar por RUT..."
            value={rutFilter}
            onChange={handleRutFilterChange}
            className={`max-w-sm ${rutInputError ? 'border-red-500' : ''}`}
          />
          <Button onClick={handleSearchByRut} disabled={isSearchingByRut}>
            {isSearchingByRut ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              "Buscar por RUT"
            )}
          </Button>
        </div>
        {rutInputError && (
          <p className="text-sm text-red-500 mt-1">
            {rutInputError}
          </p>
        )}
        {!rutInputError && (
          <p className="text-sm text-gray-500">
            Por favor, ingresa el RUT del paciente **con puntos y guion** (ej. 12.345.678-9).
          </p>
        )}
      </div>

      {patientsToDisplay && patientsToDisplay.length > 0 ? (
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Apellido</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>RUT</TableHead>
                <TableHead>Fecha Nac.</TableHead>
                <TableHead>Género</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {patientsToDisplay.map((patient) => (
                <TableRow key={patient.paciente_id}>
                  <TableCell className="font-medium">
                    {patient.nombre}
                  </TableCell>
                  <TableCell>{patient.apellido}</TableCell>
                  <TableCell>{patient.email}</TableCell>
                  <TableCell>{patient.rut || "N/A"}</TableCell>
                  <TableCell>
                    {format(new Date(patient.fecha_nacimiento), "dd/MM/yyyy")}
                  </TableCell>
                  <TableCell>{patient.genero}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() =>
                          handleViewDetailsClick(patient.paciente_id)
                        }
                      >
                        <EyeIcon className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleEditClick(patient)}
                      >
                        <EditIcon className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="icon">
                            <Trash2Icon className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              ¿Estás absolutamente seguro?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta acción no se puede deshacer. Esto eliminará
                              permanentemente al paciente y todos sus datos
                              asociados.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() =>
                                handleDeletePatient(patient.paciente_id)
                              }
                            >
                              Eliminar
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <p className="text-center text-gray-500 mt-8">
          {rutFilter && !filteredPatient
            ? `No se encontró ningún paciente con RUT: "${rutFilter}".`
            : "No hay pacientes registrados."}
        </p>
      )}

      {/* Modal de Edición */}
      {editingPatient && (
        <Dialog
          open={!!editingPatient}
          onOpenChange={() => setEditingPatient(null)}
        >
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Editar Paciente</DialogTitle>
              <DialogDescription>
                Modifica los datos del paciente.
              </DialogDescription>
            </DialogHeader>
            <PatientForm
              initialData={editingPatient}
              onSubmit={handleUpdatePatient}
              isSubmitting={updatePatientMutation.isPending}
              onCancel={() => setEditingPatient(null)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default PatientsPage;