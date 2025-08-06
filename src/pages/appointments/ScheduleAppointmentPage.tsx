import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DateTime } from "luxon";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "react-toastify";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";

import type { Paciente, Administrador, TipoAtencion, TimeSlot } from "@/types";
// Asumimos que los servicios están disponibles y no necesitan ser redefinidos aquí
import { patientService } from "@/services/patientService";
import { administratorService } from "@/services/administratorService";
import { attentionTypeService } from "@/services/attentionTypeService";
import { appointmentService } from "@/services/appointmentService";
import { availabilityService } from "@/services/availabilityService";

const CHILE_TIMEZONE = "America/Santiago";

const ScheduleAppointmentPage: React.FC = () => {
  const queryClient = useQueryClient();

  // --- NUEVO ESTADO PARA CONTROLAR LOS PASOS DEL FORMULARIO ---
  const [step, setStep] = useState(1);

  // --- ESTADOS EXISTENTES ---
  const [patientSearchQuery, setPatientSearchQuery] = useState<string>("");
  const [selectedPatient, setSelectedPatient] = useState<Paciente | null>(null);
  const [selectedAdministratorId, setSelectedAdministratorId] = useState<
    number | null
  >(null);
  const [selectedAttentionTypeId, setSelectedAttentionTypeId] = useState<
    number | null
  >(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(
    null
  );
  const [appointmentNotes, setAppointmentNotes] = useState<string>("");

  // --- LÓGICA DE CONSULTAS (useQuery) - NO SE MODIFICA ---
  const { data: administrators, isLoading: isLoadingAdministrators } = useQuery<
    Administrador[]
  >({
    queryKey: ["administrators"],
    queryFn: administratorService.getAll,
  });

  const { data: attentionTypes, isLoading: isLoadingAttentionTypes } = useQuery<
    TipoAtencion[]
  >({
    queryKey: ["attentionTypes"],
    queryFn: attentionTypeService.getAll,
  });

  const {
    data: searchedPatients,
    isFetching: isFetchingPatients,
  } = useQuery<Paciente[]>({
    queryKey: ["patientsSearch", patientSearchQuery],
    queryFn: () => patientService.searchPatients(patientSearchQuery),
    enabled: patientSearchQuery.length >= 3,
    staleTime: 5 * 60 * 1000,
  });

  const {
    data: availableSlots,
    isLoading: isLoadingSlots,
    isError: isErrorSlots,
    error: slotsError,
  } = useQuery<TimeSlot[]>({
    queryKey: [
      "availableSlots",
      selectedAdministratorId,
      selectedDate
        ? DateTime.fromJSDate(selectedDate, {
            zone: CHILE_TIMEZONE,
          }).toISODate()
        : undefined,
      selectedAttentionTypeId,
    ],
    queryFn: () => {
      const dateForApi = DateTime.fromJSDate(selectedDate!, {
        zone: CHILE_TIMEZONE,
      }).toISODate();
      return availabilityService.getAvailableSlots(
        selectedAdministratorId!,
        dateForApi!,
        selectedAttentionTypeId!
      );
    },
    enabled: !!selectedAdministratorId && !!selectedDate && !!selectedAttentionTypeId,
    staleTime: 0,
    gcTime: 0,
  });

  // --- LÓGICA DE MUTACIÓN (useMutation) - NO SE MODIFICA ---
  const createAppointmentMutation = useMutation({
    mutationFn: appointmentService.create,
    onSuccess: () => {
      toast.success("Cita agendada exitosamente.");
      queryClient.invalidateQueries({ queryKey: ["availableSlots"] });
      // Reiniciar todos los estados para un nuevo formulario
      setSelectedPatient(null);
      setPatientSearchQuery("");
      setSelectedAdministratorId(null);
      setSelectedAttentionTypeId(null);
      setSelectedDate(undefined);
      setSelectedTimeSlot(null);
      setAppointmentNotes("");
      setStep(1); // Volver al primer paso
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Error desconocido al agendar cita.";
      toast.error(`Error al agendar cita: ${errorMessage}`);
    },
  });

  // --- MANEJADORES DE EVENTOS ---
  const handlePatientSelect = (patient: Paciente) => {
    setSelectedPatient(patient);
    setPatientSearchQuery(
      `${patient.nombre} ${patient.apellido} (${patient.rut})`
    );
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPatientSearchQuery(e.target.value);
    if (!e.target.value) {
      setSelectedPatient(null);
    }
  };

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    setSelectedTimeSlot(null); // Reiniciar el slot al cambiar la fecha
  };

  const handleSlotSelect = (slot: TimeSlot) => {
    setSelectedTimeSlot(slot);
  };

  const handleSubmitAppointment = () => {
    if (
      !selectedPatient ||
      !selectedAdministratorId ||
      !selectedAttentionTypeId ||
      !selectedDate ||
      !selectedTimeSlot
    ) {
      toast.error("Por favor, complete todos los campos requeridos.");
      return;
    }
    const fechaHoraCitaUTC = DateTime.fromISO(selectedTimeSlot.start, {
      zone: "utc",
    }).toJSDate();

    const appointmentData = {
      paciente_id: selectedPatient.paciente_id,
      administrador_id: selectedAdministratorId,
      tipo_atencion_id: selectedAttentionTypeId,
      fecha_hora_cita: fechaHoraCitaUTC.toISOString(),
      estado_cita: "Pendiente" as "Pendiente",
      notas: appointmentNotes,
    };
    createAppointmentMutation.mutate(appointmentData);
  };

  // --- Lógica para navegación entre pasos ---
  const canGoNext = () => {
    switch (step) {
      case 1:
        return !!selectedPatient; // Habilitar si hay un paciente seleccionado
      case 2:
        return !!selectedAdministratorId && !!selectedAttentionTypeId; // Habilitar si admin y tipo de atención están seleccionados
      case 3:
        return !!selectedDate && !!selectedTimeSlot; // Habilitar si fecha y hora están seleccionadas
      default:
        return false;
    }
  };

  // --- RENDERING CONDICIONAL DE CADA PASO ---
  return (
    <div className="container mx-auto p-6 flex justify-center items-center h-screen">
      <Card className="w-full max-w-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">Agendar Nueva Cita</CardTitle>
          <CardDescription>
            Paso {step} de 4
          </CardDescription>
          <div className="mt-4 h-2 bg-gray-200 rounded-full">
            <div
              className="h-full bg-blue-500 rounded-full transition-all duration-300"
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>
        </CardHeader>
        <CardContent>
          {/* PASO 1: SELECCIONAR PACIENTE */}
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">1. Seleccionar Paciente</h2>
              <div>
                <Label htmlFor="patient-search">Buscar Paciente</Label>
                <Input
                  id="patient-search"
                  placeholder="Nombre, Apellido o RUT del paciente"
                  value={patientSearchQuery}
                  onChange={handleSearchChange}
                  className="mb-2"
                />
                {isFetchingPatients && (
                  <p className="text-sm text-gray-500">Buscando pacientes...</p>
                )}
                {selectedPatient && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-md mt-2">
                    <p className="font-semibold">
                      {selectedPatient.nombre} {selectedPatient.apellido}
                    </p>
                    <p className="text-sm text-gray-600">
                      RUT: {selectedPatient.rut} | Email: {selectedPatient.email}
                    </p>
                    <Button
                      variant="link"
                      size="sm"
                      onClick={() => setSelectedPatient(null)}
                      className="p-0 h-auto mt-1"
                    >
                      Cambiar paciente
                    </Button>
                  </div>
                )}
                {!selectedPatient &&
                  searchedPatients &&
                  searchedPatients.length > 0 &&
                  patientSearchQuery.length >= 3 && (
                    <div className="border rounded-md max-h-48 overflow-y-auto mt-2">
                      {searchedPatients.map((patient) => (
                        <div
                          key={patient.paciente_id}
                          className="p-2 cursor-pointer hover:bg-gray-100 border-b last:border-b-0"
                          onClick={() => handlePatientSelect(patient)}
                        >
                          <p className="font-medium">
                            {patient.nombre} {patient.apellido}
                          </p>
                          <p className="text-sm text-gray-600">
                            RUT: {patient.rut} | Email: {patient.email}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                {!selectedPatient &&
                  !isFetchingPatients &&
                  patientSearchQuery.length >= 3 &&
                  searchedPatients?.length === 0 && (
                    <p className="text-sm text-red-500 mt-2">
                      No se encontraron pacientes.
                    </p>
                  )}
              </div>
            </div>
          )}

          {/* PASO 2: SELECCIONAR ADMINISTRADOR Y TIPO DE ATENCIÓN */}
          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">2. Detalles de la Cita</h2>
              <div>
                <Label htmlFor="administrator-select" className="mb-2 block">
                  Administrador
                </Label>
                <Select
                  onValueChange={(value) => setSelectedAdministratorId(Number(value))}
                  value={selectedAdministratorId?.toString() || ""}
                  disabled={isLoadingAdministrators}
                >
                  <SelectTrigger id="administrator-select">
                    <SelectValue placeholder="Seleccionar administrador" />
                  </SelectTrigger>
                  <SelectContent>
                    {administrators?.map((admin) => (
                      <SelectItem
                        key={admin.administrador_id}
                        value={admin.administrador_id.toString()}
                      >
                        {admin.nombre} {admin.apellido}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="attention-type-select" className="mb-2 block">
                  Tipo de Atención
                </Label>
                <Select
                  onValueChange={(value) => setSelectedAttentionTypeId(Number(value))}
                  value={selectedAttentionTypeId?.toString() || ""}
                  disabled={isLoadingAttentionTypes}
                >
                  <SelectTrigger id="attention-type-select">
                    <SelectValue placeholder="Seleccionar tipo de atención" />
                  </SelectTrigger>
                  <SelectContent>
                    {attentionTypes?.map((type) => (
                      <SelectItem
                        key={type.tipo_atencion_id}
                        value={type.tipo_atencion_id.toString()}
                      >
                        {type.nombre_atencion} ({type.duracion_minutos} min)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* PASO 3: SELECCIONAR FECHA Y HORA */}
          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">3. Fecha y Hora</h2>
              <div>
                <Label htmlFor="date-picker" className="mb-2 block">
                  Fecha de la Cita
                </Label>
                <div className="flex justify-center">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={handleDateSelect}
                    className="rounded-md border shadow"
                    disabled={(date) =>
                      date < new Date() ||
                      date > new Date(new Date().setMonth(new Date().getMonth() + 6))
                    }
                    initialFocus
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="time-slots" className="mb-2 block">
                  Horas Disponibles
                </Label>
                {!selectedAdministratorId || !selectedAttentionTypeId || !selectedDate ? (
                  <p className="text-gray-500 text-sm">
                    Selecciona un administrador, tipo de atención y fecha para ver las horas.
                  </p>
                ) : isLoadingSlots ? (
                  <p className="text-sm">Cargando horas disponibles...</p>
                ) : isErrorSlots ? (
                  <p className="text-red-500 text-sm">
                    Error al cargar horas: {slotsError?.message}
                  </p>
                ) : (
                  <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto">
                    {availableSlots && availableSlots.length > 0 ? (
                      availableSlots.map((slot: TimeSlot) => {
                        const slotStartLocal = DateTime.fromISO(slot.start, { zone: "utc" }).setZone(CHILE_TIMEZONE);
                        const slotEndLocal = DateTime.fromISO(slot.end, { zone: "utc" }).setZone(CHILE_TIMEZONE);
                        const startTime = slotStartLocal.toLocaleString(DateTime.TIME_24_SIMPLE);
                        const endTime = slotEndLocal.toLocaleString(DateTime.TIME_24_SIMPLE);
                        const isSelected = selectedTimeSlot && selectedTimeSlot.start === slot.start;
                        return (
                          <Button
                            key={slot.start}
                            variant={isSelected ? "default" : "outline"}
                            onClick={() => handleSlotSelect(slot)}
                            className="justify-center"
                          >
                            {startTime} - {endTime}
                          </Button>
                        );
                      })
                    ) : (
                      <p className="text-gray-500 text-sm col-span-2">
                        No hay franjas horarias disponibles.
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* PASO 4: NOTAS Y CONFIRMACIÓN */}
          {step === 4 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">4. Notas y Confirmación</h2>
              <div>
                <Label htmlFor="appointment-notes" className="mb-2 block">
                  Notas de la Cita (Opcional)
                </Label>
                <Textarea
                  id="appointment-notes"
                  placeholder="Ingresa cualquier nota relevante para esta cita..."
                  value={appointmentNotes}
                  onChange={(e) => setAppointmentNotes(e.target.value)}
                  rows={3}
                />
              </div>
              <div className="p-4 bg-gray-50 rounded-md border border-gray-200">
                <h3 className="font-semibold text-lg">Resumen de la Cita</h3>
                <p className="text-sm">
                  <span className="font-medium">Paciente:</span> {selectedPatient?.nombre} {selectedPatient?.apellido}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Administrador:</span> {administrators?.find(a => a.administrador_id === selectedAdministratorId)?.nombre}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Tipo de Atención:</span> {attentionTypes?.find(t => t.tipo_atencion_id === selectedAttentionTypeId)?.nombre_atencion}
                </p>
                {selectedTimeSlot && (
                  <p className="text-sm">
                    <span className="font-medium">Fecha y Hora:</span>{" "}
                    {DateTime.fromISO(selectedTimeSlot.start, { zone: "utc" }).setZone(CHILE_TIMEZONE).toLocaleString(DateTime.DATETIME_SHORT)}
                  </p>
                )}
              </div>
            </div>
          )}
        </CardContent>
        {/* NAVEGACIÓN ENTRE PASOS */}
        <div className="flex justify-between p-6 pt-0">
          {step > 1 && (
            <Button
              variant="outline"
              onClick={() => setStep(step - 1)}
              disabled={createAppointmentMutation.isPending}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Atrás
            </Button>
          )}
          {step < 4 && (
            <Button
              onClick={() => setStep(step + 1)}
              disabled={!canGoNext() || createAppointmentMutation.isPending}
              className="ml-auto" // Empujar a la derecha
            >
              Siguiente
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
          {step === 4 && (
            <Button
              onClick={handleSubmitAppointment}
              disabled={!canGoNext() || createAppointmentMutation.isPending}
              className="w-full"
            >
              {createAppointmentMutation.isPending ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Agendando...
                </>
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Confirmar Cita
                </>
              )}
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
};

export default ScheduleAppointmentPage;
