import { useState, useCallback } from "react";
import type { UseFormReturn } from "react-hook-form";
import { DateTime } from "luxon";
import { isValid, parseISO } from "date-fns";
import type {
  TimeSlot,
  PacienteEnCita,
} from "@/types";

// CHILE_TIMEZONE es necesario aquí para la validación de la hora en el paso 3
const CHILE_TIMEZONE = "America/Santiago";

interface UseMultiStepFormProps {
  form: UseFormReturn<any>;
  isEditing: boolean;
  selectedPatientInForm: PacienteEnCita | null | undefined;
  administradorIdValue: number | undefined;
  tipoAtencionIdValue: number | undefined;
  selectedDate: Date | undefined;
  availableTimes: TimeSlot[] | undefined;
}

interface UseMultiStepFormResult {
  step: number;
  setStep: React.Dispatch<React.SetStateAction<number>>;
  canGoNext: () => boolean;
}

export const useMultiStepForm = ({
  form,
  isEditing,
  selectedPatientInForm,
  administradorIdValue,
  tipoAtencionIdValue,
  selectedDate,
  availableTimes,
}: UseMultiStepFormProps): UseMultiStepFormResult => {
  const [step, setStep] = useState(1);

  const canGoNext = useCallback(() => {
    switch (step) {
      case 1: // Paso de selección de paciente
        return !!selectedPatientInForm;
      case 2: // Paso de selección de administrador y tipo de atención
        return !!administradorIdValue && !!tipoAtencionIdValue;
      case 3: {
        // Paso de selección de fecha y hora
        const currentFechaHoraCita = form.getValues("fecha_hora_cita");
        const startOfDayInChileISO = selectedDate
          ? DateTime.fromJSDate(selectedDate, { zone: CHILE_TIMEZONE })
              .startOf("day")
              .toUTC()
              .toISO()
          : null;

        // Una hora específica se considera seleccionada por el usuario si el valor de fecha_hora_cita es válido
        // Y NO es simplemente el ISO string del inicio del día.
        const isSpecificTimeSlotSelectedByUser =
          currentFechaHoraCita &&
          isValid(parseISO(currentFechaHoraCita)) &&
          currentFechaHoraCita !== startOfDayInChileISO;

        return (
          !!selectedDate &&
          isSpecificTimeSlotSelectedByUser && // Debe ser una hora específica seleccionada por el usuario
          availableTimes?.some((slot) => slot.start === currentFechaHoraCita) && // Y debe estar en las horas disponibles
          !form.formState.errors.fecha_hora_cita // Y no debe haber errores de validación en el campo
        );
      }
      case 4: // Paso de notas y confirmación
        return true; // Siempre se puede avanzar al final desde las notas
      default:
        return false;
    }
  }, [
    step,
    selectedPatientInForm,
    administradorIdValue,
    tipoAtencionIdValue,
    selectedDate,
    form,
    availableTimes, // Dependencia para verificar si la hora seleccionada está en las disponibles
  ]);

  return {
    step,
    setStep,
    canGoNext,
  };
};
