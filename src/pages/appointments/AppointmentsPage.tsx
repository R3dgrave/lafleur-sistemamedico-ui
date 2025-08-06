//src/pages/appointments/AppointmentsPage.tsx
import React, { useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { format } from "date-fns";
import { es } from "date-fns/locale";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  PlusIcon,
  EditIcon,
  Trash2Icon,
  CalendarIcon,
  Loader2,
} from "lucide-react";

// Servicios
import { appointmentService } from "@/services/appointmentService";
import { administratorService } from "@/services/administratorService";

// Tipos
import type { Cita, CreateCitaFormValues, UpdateCitaFormValues, Administrador } from "@/types";

// Componentes personalizados
import AppointmentForm from "@/components/appointments/AppointmentForm";

// Hooks personalizados
import { useAppointmentFilters } from "@/hooks/appointments/useAppointmentFilters";

const AppointmentsPage: React.FC = () => {
  const queryClient = useQueryClient();

  // Estados para el modal de creación/edición
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingCita, setEditingCita] = useState<Cita | null>(null);

  // Usar el hook de filtros (ya incluye pacientes y tipos de atención)
  const {
    filterPacienteId,
    setFilterPacienteId,
    filterTipoAtencionId,
    setFilterTipoAtencionId,
    filterEstadoCita,
    setFilterEstadoCita,
    filterFechaInicio,
    setFilterFechaInicio,
    filterFechaFin,
    setFilterFechaFin,
    handleClearFilters,
    allPatients,
    isLoadingAllPatients,
    allAttentionTypes,
    isLoadingAllAttentionTypes,
    citas,
    isLoadingCitas,
    isErrorCitas,
    citasError,
  } = useAppointmentFilters();

  // Carga la lista de administradores
  const {
    data: administrators,
    isLoading: isLoadingAdministrators,
    isError: isErrorAdministrators,
    error: administratorsError,
  } = useQuery<Administrador[], Error>({
    queryKey: ["administrators"],
    queryFn: administratorService.getAll,
    staleTime: 5 * 60 * 1000, // Los datos se consideran "frescos" por 5 minutos
  });

  // Mutaciones de citas
  const createCitaMutation = useMutation<Cita, Error, CreateCitaFormValues>({
    mutationFn: appointmentService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["citas"] });
      queryClient.invalidateQueries({ queryKey: ["availableSlots"] });
      toast.success("Cita agendada exitosamente.");
      setIsCreateModalOpen(false); // Cierra el modal de creación
    },
    onError: (err) => {
      console.error("Error al agendar cita:", err);
      toast.error(`Error al agendar cita: ${err.message}`);
    },
  });

  const updateCitaMutation = useMutation<
    Cita,
    Error,
    { id: number; data: UpdateCitaFormValues }
  >({
    mutationFn: ({ id, data }) => appointmentService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["citas"] });
      queryClient.invalidateQueries({ queryKey: ["availableSlots"] });
      toast.success("Cita actualizada exitosamente.");
      setEditingCita(null); // Cierra el modal de edición
    },
    onError: (err) => {
      console.error("Error al actualizar cita:", err);
      toast.error(`Error al actualizar cita: ${err.message}`);
    },
  });

  const deleteCitaMutation = useMutation<any, Error, number>({
    mutationFn: appointmentService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["citas"] });
      toast.success("Cita eliminada exitosamente.");
    },
    onError: (err) => {
      console.error("Error al eliminar cita:", err);
      toast.error(`Error al eliminar cita: ${err.message}`);
    },
  });

  // Handlers para el formulario de citas
  const handleSubmitForm = (
    data: CreateCitaFormValues | UpdateCitaFormValues
  ) => {
    if (editingCita) {
      updateCitaMutation.mutate({
        id: editingCita.cita_id,
        data: data as UpdateCitaFormValues,
      });
    } else {
      createCitaMutation.mutate(data as CreateCitaFormValues);
    }
  };

  const handleEditClick = (cita: Cita) => {
    setEditingCita(cita);
  };

  const handleCloseEditModal = () => {
    setEditingCita(null);
  };

  const handleOpenCreateModal = () => {
    setEditingCita(null); // Asegura que no estamos en modo edición al abrir para crear
    setIsCreateModalOpen(true);
  };

  // Estados de carga combinados
  const isLoadingCombined =
    isLoadingCitas ||
    isLoadingAllPatients ||
    isLoadingAllAttentionTypes ||
    isLoadingAdministrators;

  const isSubmittingForm =
    createCitaMutation.isPending || updateCitaMutation.isPending;

  // Renderizado de estados de carga y error
  if (isLoadingCombined) {
    return (
      <div className="flex min-h-screen items-center justify-center text-xl">
        <Loader2 className="mr-2 h-8 w-8 animate-spin" />
        <p>Cargando citas y filtros...</p>
      </div>
    );
  }

  if (isErrorCitas) {
    return (
      <div className="flex min-h-screen items-center justify-center text-xl text-red-500">
        Error al cargar citas: {citasError?.message}
      </div>
    );
  }

  // Manejo de error para administradores
  if (isErrorAdministrators) {
    return (
      <div className="flex min-h-screen items-center justify-center text-xl text-red-500">
        Error al cargar administradores: {administratorsError?.message}
      </div>
    );
  }

  function handleDeleteCita(cita_id: number): void {
    deleteCitaMutation.mutate(cita_id);
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Gestión de Citas</h1>

      <div className="flex justify-end mb-4">
        <Button onClick={handleOpenCreateModal}>
          <PlusIcon className="mr-2 h-4 w-4" /> Agendar Nueva Cita
        </Button>
      </div>

      {/* Sección de Filtros */}
      <div className="mb-6 p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
        <h2 className="text-xl font-semibold mb-3">Filtros de Citas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="filterPaciente">Paciente</Label>
            <Select
              value={filterPacienteId?.toString() || ""}
              onValueChange={(value) =>
                setFilterPacienteId(value === "all" ? undefined : Number(value))
              }
              disabled={isLoadingAllPatients}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por paciente" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los pacientes</SelectItem>
                {allPatients?.map((p) => (
                  <SelectItem
                    key={p.paciente_id}
                    value={p.paciente_id.toString()}
                  >
                    {p.nombre} {p.apellido} ({p.rut || "N/A"})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="filterTipoAtencion">Tipo de Atención</Label>
            <Select
              value={filterTipoAtencionId?.toString() || ""}
              onValueChange={(value) =>
                setFilterTipoAtencionId(
                  value === "all" ? undefined : Number(value)
                )
              }
              disabled={isLoadingAllAttentionTypes}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por tipo de atención" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tipos de atención</SelectItem>
                {allAttentionTypes?.map((ta) => (
                  <SelectItem
                    key={ta.tipo_atencion_id}
                    value={ta.tipo_atencion_id.toString()}
                  >
                    {ta.nombre_atencion} ({ta.duracion_minutos} min)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="filterEstadoCita">Estado de la Cita</Label>
            <Select
              value={filterEstadoCita}
              onValueChange={(value) =>
                setFilterEstadoCita(value === "all" ? "" : value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="Pendiente">Pendiente</SelectItem>
                <SelectItem value="Confirmada">Confirmada</SelectItem>
                <SelectItem value="Cancelada">Cancelada</SelectItem>
                <SelectItem value="Completada">Completada</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="filterFechaInicio">Fecha Inicio</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !filterFechaInicio && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filterFechaInicio ? (
                    format(filterFechaInicio, "PPP", { locale: es })
                  ) : (
                    <span>Selecciona fecha</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={filterFechaInicio}
                  onSelect={setFilterFechaInicio}
                  initialFocus
                  locale={es}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="filterFechaFin">Fecha Fin</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !filterFechaFin && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filterFechaFin ? (
                    format(filterFechaFin, "PPP", { locale: es })
                  ) : (
                    <span>Selecciona fecha</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={filterFechaFin}
                  onSelect={setFilterFechaFin}
                  initialFocus
                  locale={es}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={handleClearFilters}>
            Limpiar Filtros
          </Button>
        </div>
      </div>

      {/* Tabla de Citas */}
      {citas && citas.length > 0 ? (
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Paciente</TableHead>
                <TableHead>Tipo de Atención</TableHead>
                <TableHead>Administrador</TableHead>
                <TableHead>Fecha y Hora</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Notas</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {citas.map((cita) => (
                <TableRow key={cita.cita_id}>
                  <TableCell className="font-medium">
                    {cita.Paciente
                      ? `${cita.Paciente.nombre} ${cita.Paciente.apellido}`
                      : "N/A"}
                  </TableCell>
                  <TableCell>
                    {cita.TipoAtencion
                      ? cita.TipoAtencion.nombre_atencion
                      : "N/A"}
                  </TableCell>
                  {/* Mostrar nombre del administrador */}
                  <TableCell>
                    {cita.Administrador
                      ? `${cita.Administrador.nombre} ${cita.Administrador.apellido}`
                      : "N/A"}
                  </TableCell>
                  <TableCell>
                    {format(
                      new Date(cita.fecha_hora_cita),
                      "dd/MM/yyyy HH:mm",
                      { locale: es }
                    )}
                  </TableCell>
                  <TableCell>{cita.estado_cita}</TableCell>
                  <TableCell className="max-w-[200px] truncate">
                    {cita.notas || "Sin notas"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleEditClick(cita)}
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
                              permanentemente la cita.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteCita(cita.cita_id)}
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
          No hay citas registradas que coincidan con los filtros.
        </p>
      )}

      {/* Modal para Crear/Editar Cita */}
      <Dialog
        open={isCreateModalOpen || !!editingCita}
        onOpenChange={(open) => {
          if (!open) {
            setIsCreateModalOpen(false);
            setEditingCita(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingCita ? "Editar Cita" : "Agendar Nueva Cita"}
            </DialogTitle>
            <DialogDescription>
              {editingCita
                ? "Modifica los datos de la cita."
                : "Completa los datos para agendar una nueva cita."}
            </DialogDescription>
          </DialogHeader>
          <AppointmentForm
            appointment={editingCita || undefined}
            onSubmit={handleSubmitForm}
            isSubmitting={isSubmittingForm}
            onCancel={() => {
              setIsCreateModalOpen(false);
              setEditingCita(null);
            }}
            administrators={administrators || []}
            isLoadingAdministrators={isLoadingAdministrators}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AppointmentsPage;