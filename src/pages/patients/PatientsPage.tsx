import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
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
import type {
  Paciente,
  CreatePacienteFormValues,
  UpdatePacienteFormValues,
} from "@/types";
import PatientForm from "@/components/patients/PatientForm";
import { usePatients } from "@/hooks/patients/usePatients";
import { useDebounce } from "@/hooks/useDebounce";

import { toast } from "react-toastify";
import { AxiosError } from "axios";

const PatientsPage: React.FC = () => {
  const navigate = useNavigate();
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Paciente | null>(null);
  const [localRutFilter, setLocalRutFilter] = useState("");
  const debouncedRutFilter = useDebounce(localRutFilter, 500);

  const {
    patients,
    isLoading,
    isFetching,
    isError,
    error,
    createPatientMutation,
    updatePatientMutation,
    deletePatientMutation,
    handleBackendError,
  } = usePatients(debouncedRutFilter);

  const [formBackendErrors, setFormBackendErrors] = useState<any>(undefined);

  const isFilterTooShort =
    localRutFilter.trim().length > 0 && localRutFilter.trim().length < 3;
  const showLoading = (isLoading || isFetching) && !isFilterTooShort;

  const handleSubmitForm = async (
    data: CreatePacienteFormValues | UpdatePacienteFormValues
  ) => {
    setFormBackendErrors(undefined);

    try {
      if (editingPatient) {
        await updatePatientMutation.mutateAsync({
          id: editingPatient.paciente_id,
          data: data as UpdatePacienteFormValues,
        });
        toast.success("Paciente actualizado exitosamente.");
      } else {
        await createPatientMutation.mutateAsync(
          data as CreatePacienteFormValues
        );
        toast.success("Paciente creado exitosamente.");
      }
      setIsFormModalOpen(false);
      setEditingPatient(null);
    } catch (err) {
      const errorsFromBackend = handleBackendError(err);
      if (errorsFromBackend) {
        setFormBackendErrors(errorsFromBackend);
      } else {
        let errorMessage = "Ocurrió un error inesperado.";
        if (
          err instanceof AxiosError &&
          err.response &&
          err.response.data &&
          err.response.data.message
        ) {
          errorMessage = err.response.data.message;
        } else if (err instanceof Error) {
          errorMessage = err.message;
        }
        toast.error(`Error: ${errorMessage}`);
      }
    }
  };

  const handleOpenCreateModal = () => {
    setEditingPatient(null);
    setFormBackendErrors(undefined);
    setIsFormModalOpen(true);
  };

  const handleEditClick = (patient: Paciente) => {
    setEditingPatient(patient);
    setFormBackendErrors(undefined);
    setIsFormModalOpen(true);
  };

  const handleDeletePatient = (id: number) => {
    deletePatientMutation.mutate(id);
  };

  const handleViewDetailsClick = (id: number) => {
    navigate(`/pacientes/${id}`);
  };

  const isSubmittingForm =
    createPatientMutation.isPending || updatePatientMutation.isPending;

  if (showLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-xl">
        <Loader2 className="mr-2 h-8 w-8 animate-spin" />
        <p>Cargando pacientes...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex min-h-screen items-center justify-center text-xl text-red-500">
        Error al cargar pacientes: {error?.message}
      </div>
    );
  }

  const patientRows = patients?.map((patient) => {
    const dateOfBirth = new Date(patient.fecha_nacimiento);
    const formattedDate = !isNaN(dateOfBirth.getTime())
      ? format(dateOfBirth, "dd/MM/yyyy")
      : "N/A";

    return (
      <TableRow key={patient.paciente_id}>
        <TableCell className="font-medium">{patient.nombre}</TableCell>
        <TableCell>{patient.apellido}</TableCell>
        <TableCell>{patient.email}</TableCell>
        <TableCell>{patient.rut || "N/A"}</TableCell>
        <TableCell>{formattedDate}</TableCell>
        <TableCell>{patient.genero}</TableCell>
        <TableCell className="text-right">
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleViewDetailsClick(patient.paciente_id)}
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
                <Button
                  variant="destructive"
                  size="icon"
                  disabled={deletePatientMutation.isPending}
                >
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
                    permanentemente al paciente y todos sus datos asociados.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => handleDeletePatient(patient.paciente_id)}
                  >
                    Eliminar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </TableCell>
      </TableRow>
    );
  });

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">
        Gestión de Pacientes
      </h1>

      <div className="mb-6 flex flex-col md:flex-row items-start gap-4 md:justify-between md:items-center">
        <Input
          placeholder="Filtrar por RUT, Nombres o Apellidos..."
          value={localRutFilter}
          onChange={(e) => setLocalRutFilter(e.target.value)}
          className="max-w-sm"
        />
        {isFilterTooShort && (
          <p className="mt-2 text-sm text-red-500">
            Se requieren al menos 3 caracteres para buscar.
          </p>
        )}
        <Button onClick={handleOpenCreateModal}>
          <PlusIcon className="mr-2 h-4 w-4" /> Nuevo Paciente
        </Button>
      </div>

      {patients && patients.length > 0 ? (
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
            <TableBody>{patientRows}</TableBody>
          </Table>
        </div>
      ) : (
        <p className="text-center text-gray-500 mt-8">
          {localRutFilter
            ? isFilterTooShort
              ? "Ingresa al menos 3 caracteres para buscar pacientes."
              : `No se encontró ningún paciente con el término "${localRutFilter}".`
            : "No hay pacientes registrados."}
        </p>
      )}

      <Dialog
        open={isFormModalOpen}
        onOpenChange={(open) => {
          setIsFormModalOpen(open);
          if (!open) {
            setEditingPatient(null);
            setFormBackendErrors(undefined);
          }
        }}
      >
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingPatient ? "Editar Paciente" : "Crear Nuevo Paciente"}
            </DialogTitle>
            <DialogDescription>
              {editingPatient
                ? "Modifica los datos del paciente."
                : "Completa los datos para registrar un nuevo paciente."}
            </DialogDescription>
          </DialogHeader>
          <PatientForm
            initialData={editingPatient || undefined}
            onSubmit={handleSubmitForm}
            isSubmitting={isSubmittingForm}
            onCancel={() => {
              setIsFormModalOpen(false);
              setEditingPatient(null);
              setFormBackendErrors(undefined);
            }}
            backendErrors={formBackendErrors}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PatientsPage;
