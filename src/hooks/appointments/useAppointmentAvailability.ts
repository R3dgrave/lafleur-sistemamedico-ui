import { useCallback, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { DateTime } from "luxon";
import { isValid, parseISO } from "date-fns";
// Se ha cambiado la importación a appointmentService
import { appointmentService } from "@/services/appointmentService";
import { administratorService } from "@/services/administratorService";
import { attentionTypeService } from "@/services/attentionTypeService";
import type { Administrador, TipoAtencion, TimeSlot, Cita } from "@/types";
import type { UseFormReturn } from "react-hook-form";

const CHILE_TIMEZONE = "America/Santiago";

interface UseAppointmentAvailabilityProps {
  form: UseFormReturn<any>;
  initialData?: Cita;
  isSubmitting: boolean;
}

interface UseAppointmentAvailabilityResult {
  selectedDate: Date | undefined;
  selectedDateStringForAPI: string | undefined;
  tipoAtencionIdValue: number | undefined;
  administradorIdValue: number | undefined;
  administrators: Administrador[] | undefined;
  isLoadingAdministrators: boolean;
  attentionTypes: TipoAtencion[] | undefined;
  isLoadingAttentionTypes: boolean;
  availableTimes: TimeSlot[] | undefined;
  isLoadingAvailableTimes: boolean;
  isErrorSlots: boolean;
  slotsError: Error | null;
  canShowSlots: boolean;
  handleDateSelect: (date: Date | undefined) => void;
  handleTimeSelect: (isoTimeString: string) => void;
  handleAttentionTypeSelectChange: (value: string) => void;
  handleAdministratorSelectChange: (value: string) => void;
}

export const useAppointmentAvailability = ({
  form,
  initialData,
}: UseAppointmentAvailabilityProps): UseAppointmentAvailabilityResult => {
  const fechaHoraCitaValue = form.watch("fecha_hora_cita");
  const tipoAtencionIdValue = form.watch("tipo_atencion_id");
  const administradorIdValue = form.watch("administrador_id");

  useEffect(() => {
    if (initialData) {
      const defaultValues = {
        fecha_hora_cita: initialData.fecha_hora_cita
          ? new Date(initialData.fecha_hora_cita).toISOString()
          : "",
        administrador_id: initialData.administrador_id,
        tipo_atencion_id: initialData.tipo_atencion_id,
        notas: initialData.notas ?? "",
        estado_cita: initialData.estado_cita,
        cita_id: initialData.cita_id,
        paciente_id: initialData.paciente_id,
      };
      form.reset(defaultValues);
    }
  }, [initialData, form]);

  const selectedDate =
    fechaHoraCitaValue && isValid(parseISO(fechaHoraCitaValue))
      ? parseISO(fechaHoraCitaValue)
      : undefined;

  const selectedDateStringForAPI = selectedDate
    ? DateTime.fromJSDate(selectedDate, { zone: CHILE_TIMEZONE }).toISODate() ||
      undefined
    : undefined;

  const { data: administrators, isLoading: isLoadingAdministrators } = useQuery<
    Administrador[],
    Error
  >({
    queryKey: ["administrators"],
    queryFn: administratorService.getAll,
  });

  const { data: attentionTypes, isLoading: isLoadingAttentionTypes } = useQuery<
    TipoAtencion[],
    Error
  >({
    queryKey: ["attentionTypes"],
    queryFn: attentionTypeService.getAll,
  });

  const excludeCitaId = initialData?.cita_id;

  // --- MODIFICACIÓN CLAVE ---
  // Fetch de horas disponibles actualizado
  const {
    data: availableTimes,
    isLoading: isLoadingAvailableTimes,
    isError: isErrorSlots,
    error: slotsError,
  } = useQuery<TimeSlot[], Error>({
    queryKey: [
      "availableSlots",
      selectedDateStringForAPI,
      tipoAtencionIdValue,
      administradorIdValue,
      excludeCitaId,
    ],
    queryFn: () =>
      // Se ha eliminado 'tipoAtencionIdValue' del parámetro de la función
      appointmentService.getAvailableTimes(
        selectedDateStringForAPI!,
        administradorIdValue!,
        tipoAtencionIdValue!
      ),
    enabled:
      !!selectedDateStringForAPI &&
      !!administradorIdValue &&
      !!tipoAtencionIdValue,
    staleTime: 0,
    gcTime: 0,
  });

  // Handlers (sin cambios importantes, ya que el tipo de atención sigue siendo relevante para el formulario)
  const handleDateSelect = useCallback(
    (date: Date | undefined) => {
      if (date) {
        const luxonDateInChile = DateTime.fromJSDate(date, {
          zone: CHILE_TIMEZONE,
        });
        const startOfDayISO = luxonDateInChile.startOf("day").toUTC().toISO();
        form.setValue("fecha_hora_cita", startOfDayISO);
      } else {
        form.setValue("fecha_hora_cita", "");
      }
    },
    [form]
  );

  const handleTimeSelect = useCallback(
    (isoTimeString: string) => {
      form.setValue("fecha_hora_cita", isoTimeString);
    },
    [form]
  );

  const handleAttentionTypeSelectChange = useCallback(
    (value: string) => {
      form.setValue("tipo_atencion_id", Number(value));
      if (selectedDate) {
        form.setValue("fecha_hora_cita", "");
      }
    },
    [form, selectedDate]
  );

  const handleAdministratorSelectChange = useCallback(
    (value: string) => {
      form.setValue("administrador_id", Number(value));
      if (selectedDate) {
        form.setValue("fecha_hora_cita", "");
      }
    },
    [form, selectedDate]
  );
  
  const canShowSlots = !!administradorIdValue && !!selectedDate;

  return {
    selectedDate,
    selectedDateStringForAPI,
    tipoAtencionIdValue,
    administradorIdValue,
    administrators,
    isLoadingAdministrators,
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
  };
};
