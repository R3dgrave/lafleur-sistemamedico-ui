import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { DateTime } from "luxon";
import { isValid, parseISO } from "date-fns";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import {
  FormItem,
  FormLabel,
  FormField,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { createCitaSchema, updateCitaSchema } from "@/lib/validation";
import type {
  Cita,
  CreateCitaFormValues,
  UpdateCitaFormValues,
  Administrador,
} from "@/types";

import { usePatientSearch } from "@/hooks/patients/usePatientSearch";
import { useAppointmentAvailability } from "@/hooks/appointments/useAppointmentAvailability";
import { useMultiStepForm } from "@/hooks/appointments/useMultiStepForm";

import PatientStep from "@/components/appointments/PatientStep";
import DetailsStep from "@/components/appointments/DetailsStep";
import DateTimeStep from "@/components/appointments/DateTimeStep";
import NotesConfirmationStep from "@/components/appointments/NotesConfirmationStep";
import FormNavigation from "@/components/appointments/FormNavigation";

const CHILE_TIMEZONE = "America/Santiago";

// Define los mensajes de error como constantes para mejorar la legibilidad y mantenibilidad.
const NO_SLOTS_MESSAGE = "No hay horas disponibles para esta fecha, administrador y tipo de atención.";
const CONFLICT_MESSAGE = "La hora seleccionada ya no está disponible o choca con una cita existente.";

interface AppointmentFormProps {
  appointment?: Cita;
  administrators: Administrador[];
  isLoadingAdministrators: boolean;
  onSubmit: (data: CreateCitaFormValues | UpdateCitaFormValues) => void;
  isSubmitting: boolean;
  onCancel: () => void;
}

const AppointmentForm: React.FC<AppointmentFormProps> = ({
  appointment,
  administrators,
  isLoadingAdministrators,
  onSubmit: parentOnSubmit,
  isSubmitting,
  onCancel,
}) => {
  const isEditing = !!appointment;
  const formSchema = isEditing ? updateCitaSchema : createCitaSchema;

  const form = useForm<CreateCitaFormValues | UpdateCitaFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: isEditing
      ? {
          cita_id: appointment?.cita_id,
          fecha_hora_cita: appointment?.fecha_hora_cita
            ? new Date(appointment.fecha_hora_cita).toISOString()
            : "",
          administrador_id: appointment?.administrador_id,
          tipo_atencion_id: appointment?.tipo_atencion_id,
          estado_cita: appointment?.estado_cita,
          notas: appointment?.notas ?? "",
        }
      : {
          paciente_id: undefined,
          tipo_atencion_id: undefined,
          fecha_hora_cita: "",
          estado_cita: "Pendiente",
          notas: "",
          administrador_id: undefined,
        },
  });

  const [submissionError, setSubmissionError] = useState<string | null>(null);

  const {
    patientSearchQuery,
    selectedPatientInForm,
    searchedPatients,
    isLoadingSearchedPatients,
    isFetchingSearchedPatients,
    handlePatientSearchChange,
    handlePatientSelectFromSearch,
    handleClearSelectedPatient,
    isPatientSearchDisabled,
  } = usePatientSearch({
    initialData: appointment,
    isEditing,
    form,
    isSubmitting,
  });

  const {
    selectedDate,
    tipoAtencionIdValue,
    administradorIdValue,
    attentionTypes,
    isLoadingAttentionTypes,
    availableTimes,
    isLoadingAvailableTimes,
    isErrorSlots,
    slotsError,
    canShowSlots,
    handleDateSelect,
    handleTimeSelect,
    handleAttentionTypeSelectChange,
    handleAdministratorSelectChange,
  } = useAppointmentAvailability({
    form,
    initialData: appointment,
    isSubmitting,
  });

  // --- Integrar useMultiStepForm ---
  const { step, setStep, canGoNext } = useMultiStepForm({
    form,
    isEditing,
    selectedPatientInForm,
    administradorIdValue,
    tipoAtencionIdValue,
    selectedDate,
    availableTimes,
  });

  // --- Lógica de validación de fecha/hora más precisa (refactorizada) ---
  useEffect(() => {
    const currentFechaHoraCita = form.getValues("fecha_hora_cita");
    
    // Calcula el ISO string del inicio del día en la zona horaria de Chile para la fecha seleccionada.
    const startOfDayInChileISO = selectedDate
        ? DateTime.fromJSDate(selectedDate, { zone: CHILE_TIMEZONE }).startOf('day').toUTC().toISO()
        : null;

    // Determina si el usuario ha seleccionado una hora específica (no solo la fecha).
    const isSpecificTimeSlotSelectedByUser = currentFechaHoraCita && isValid(parseISO(currentFechaHoraCita)) &&
                                             currentFechaHoraCita !== startOfDayInChileISO;

    const currentErrorMessage = form.formState.errors.fecha_hora_cita?.message;
    let targetErrorMessage: string | null = null; // Inicializa el mensaje de error deseado

    // Paso 1: Determinar si no podemos validar la disponibilidad de slots (faltan inputs o están cargando).
    if (!canShowSlots || isLoadingAvailableTimes) {
        // En este estado, no hay un error específico de disponibilidad que deba mostrarse.
        // targetErrorMessage permanece null, lo que llevará a limpiar el error si existe.
    }
    // Paso 2: Si los slots están cargados y no hay horas disponibles.
    else if (availableTimes && availableTimes.length === 0) {
        targetErrorMessage = NO_SLOTS_MESSAGE;
    }
    // Paso 3: Si el usuario seleccionó una hora específica y esa hora no está en las disponibles.
    else if (isSpecificTimeSlotSelectedByUser && !availableTimes?.some(slot => slot.start === currentFechaHoraCita)) {
        const originalAppointmentTimeISO = appointment?.fecha_hora_cita ? new Date(appointment.fecha_hora_cita).toISOString() : null;
        // Solo establece el error de conflicto si no es la hora original de la cita en modo edición.
        if (!(isEditing && currentFechaHoraCita === originalAppointmentTimeISO)) {
            targetErrorMessage = CONFLICT_MESSAGE;
        }
    }
    // Paso 4: Si ninguna de las condiciones anteriores se cumple, no hay error de disponibilidad.
    // targetErrorMessage permanece null.

    // Aplicar o limpiar el error basándose en el targetErrorMessage y el currentErrorMessage.
    if (targetErrorMessage && currentErrorMessage !== targetErrorMessage) {
        // Establece el error si hay un mensaje de error deseado y es diferente al actual.
        form.setError("fecha_hora_cita", {
            type: "manual",
            message: targetErrorMessage,
        });
    } else if (!targetErrorMessage && (currentErrorMessage === NO_SLOTS_MESSAGE || currentErrorMessage === CONFLICT_MESSAGE)) {
        // Limpia el error si no hay un mensaje de error deseado Y el error actual es uno de los que manejamos.
        form.clearErrors('fecha_hora_cita');
    }
  }, [
    selectedDate,
    tipoAtencionIdValue,
    administradorIdValue,
    availableTimes,
    isLoadingAvailableTimes,
    canShowSlots,
    form,
    isEditing,
    appointment,
  ]);


  const onSubmit = async (
    data: CreateCitaFormValues | UpdateCitaFormValues
  ) => {
    setSubmissionError(null);
    try {
      const isoDateString = DateTime.fromISO(data.fecha_hora_cita!, {
        zone: "utc",
      }).toISO({ includeOffset: true });
      if (isoDateString) {
        data.fecha_hora_cita = isoDateString;
      }

      await parentOnSubmit(data);
      if (!isEditing) {
        form.reset();
        setStep(1);
        handleClearSelectedPatient();
      }
    } catch (error) {
      if (error instanceof Error) {
        const errorString = error.toString();
        if (errorString.includes("409") || errorString.includes("conflicto")) {
          setSubmissionError(
            "Error: Esta cita ya existe. Es posible que el horario ya haya sido agendado por otra persona."
          );
        } else {
          setSubmissionError(`Error al agendar la cita: ${error.message}`);
        }
      } else {
        setSubmissionError("Ocurrió un error inesperado al agendar la cita.");
      }
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {submissionError && (
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
            role="alert"
          >
            <span className="block sm:inline">{submissionError}</span>
          </div>
        )}

        <Card className="w-full max-w-lg mx-auto">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl">
              {isEditing ? "Editar Cita" : "Agendar Nueva Cita"}
            </CardTitle>
            <CardDescription>
              Paso {step} de {isEditing ? 1 : 4}
            </CardDescription>
            {!isEditing && (
              <div className="mt-4 h-2 bg-gray-200 rounded-full">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all duration-300"
                  style={{ width: `${(step / 4) * 100}%` }}
                />
              </div>
            )}
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <div className="grid grid-cols-1 gap-4">
                {/* Paciente Seleccionado (solo lectura en edición) */}
                <FormItem>
                  <FormLabel>Paciente</FormLabel>
                  <div className="p-3 bg-blue-50 border border-blue-200 dark:bg-gray-900 dark:border-gray-700 rounded-md flex flex-col items-start justify-between">
                    <div className="pb-2">
                      <p className="font-semibold">
                        {appointment?.Paciente?.nombre}{" "}
                        {appointment?.Paciente?.apellido}
                      </p>
                      <p className="text-sm">
                        RUT: {appointment?.Paciente?.rut || "N/A"}
                      </p>
                      <p className="text-sm">
                        Email: {appointment?.Paciente?.email || "N/A"}
                      </p>
                    </div>
                    <span className="text-sm text-gray-500 italic">
                      No se puede cambiar el paciente al editar una cita.
                    </span>
                  </div>
                </FormItem>

                <DetailsStep
                  form={form}
                  administrators={administrators}
                  isLoadingAdministrators={isLoadingAdministrators}
                  attentionTypes={attentionTypes}
                  isLoadingAttentionTypes={isLoadingAttentionTypes}
                  handleAdministratorSelectChange={handleAdministratorSelectChange}
                  handleAttentionTypeSelectChange={handleAttentionTypeSelectChange}
                  isSubmitting={isSubmitting}
                />

                <DateTimeStep
                  form={form}
                  selectedDate={selectedDate}
                  availableTimes={availableTimes}
                  isLoadingAvailableTimes={isLoadingAvailableTimes}
                  isErrorSlots={isErrorSlots}
                  slotsError={slotsError}
                  canShowSlots={canShowSlots}
                  handleDateSelect={handleDateSelect}
                  handleTimeSelect={handleTimeSelect}
                  isSubmitting={isSubmitting}
                />

                {/* Estado de la Cita - Mantenido aquí para edición */}
                <FormField
                  control={form.control}
                  name="estado_cita"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estado de la Cita</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={isSubmitting}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona el estado" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem key="pendiente" value="Pendiente">Pendiente</SelectItem>
                          <SelectItem key="confirmada" value="Confirmada">Confirmada</SelectItem>
                          <SelectItem key="cancelada" value="Cancelada">Cancelada</SelectItem>
                          <SelectItem key="completada" value="Completada">Completada</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <NotesConfirmationStep
                  form={form}
                  selectedPatientInForm={selectedPatientInForm}
                  administrators={administrators}
                  administradorIdValue={administradorIdValue}
                  attentionTypes={attentionTypes}
                  tipoAtencionIdValue={tipoAtencionIdValue}
                  isSubmitting={isSubmitting}
                />
              </div>
            ) : (
              <>
                {step === 1 && (
                  <PatientStep
                    form={form}
                    patientSearchQuery={patientSearchQuery}
                    selectedPatientInForm={selectedPatientInForm}
                    searchedPatients={searchedPatients}
                    isLoadingSearchedPatients={isLoadingSearchedPatients}
                    isFetchingSearchedPatients={isFetchingSearchedPatients}
                    handlePatientSearchChange={handlePatientSearchChange}
                    handlePatientSelectFromSearch={handlePatientSelectFromSearch}
                    handleClearSelectedPatient={handleClearSelectedPatient}
                    isPatientSearchDisabled={isPatientSearchDisabled}
                    isSubmitting={isSubmitting}
                  />
                )}

                {step === 2 && (
                  <DetailsStep
                    form={form}
                    administrators={administrators}
                    isLoadingAdministrators={isLoadingAdministrators}
                    attentionTypes={attentionTypes}
                    isLoadingAttentionTypes={isLoadingAttentionTypes}
                    handleAdministratorSelectChange={handleAdministratorSelectChange}
                    handleAttentionTypeSelectChange={handleAttentionTypeSelectChange}
                    isSubmitting={isSubmitting}
                  />
                )}

                {step === 3 && (
                  <DateTimeStep
                    form={form}
                    selectedDate={selectedDate}
                    availableTimes={availableTimes}
                    isLoadingAvailableTimes={isLoadingAvailableTimes}
                    isErrorSlots={isErrorSlots}
                    slotsError={slotsError}
                    canShowSlots={canShowSlots}
                    handleDateSelect={handleDateSelect}
                    handleTimeSelect={handleTimeSelect}
                    isSubmitting={isSubmitting}
                  />
                )}

                {step === 4 && (
                  <NotesConfirmationStep
                    form={form}
                    selectedPatientInForm={selectedPatientInForm}
                    administrators={administrators}
                    administradorIdValue={administradorIdValue}
                    attentionTypes={attentionTypes}
                    tipoAtencionIdValue={tipoAtencionIdValue}
                    isSubmitting={isSubmitting}
                  />
                )}
              </>
            )}
          </CardContent>

          <FormNavigation
            step={step}
            setStep={setStep}
            canGoNext={canGoNext}
            isSubmitting={isSubmitting}
            isEditing={isEditing}
            onCancel={onCancel}
            onSubmit={form.handleSubmit(onSubmit)}
          />
        </Card>
      </form>
    </Form>
  );
};

export default AppointmentForm;