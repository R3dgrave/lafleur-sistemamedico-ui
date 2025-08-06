import React from "react";
import type { UseFormReturn } from "react-hook-form";
import { Textarea } from "@/components/ui/textarea";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { DateTime } from "luxon";
import type {
  Administrador,
  TipoAtencion,
  Paciente,
  CreateCitaFormValues,
  UpdateCitaFormValues,
} from "@/types";

const CHILE_TIMEZONE = "America/Santiago";

interface NotesConfirmationStepProps {
  form: UseFormReturn<CreateCitaFormValues | UpdateCitaFormValues>;
  selectedPatientInForm: Paciente | null | undefined;
  administrators: Administrador[] | undefined;
  administradorIdValue: number | undefined;
  attentionTypes: TipoAtencion[] | undefined;
  tipoAtencionIdValue: number | undefined;
  isSubmitting: boolean;
}

const NotesConfirmationStep: React.FC<NotesConfirmationStepProps> = ({
  form,
  selectedPatientInForm,
  administrators,
  administradorIdValue,
  attentionTypes,
  tipoAtencionIdValue,
  isSubmitting,
}) => {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">4. Notas y Confirmación</h2>
      <FormField
        control={form.control}
        name="notas"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Notas (opcional)</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Ingresa cualquier nota relevante para esta cita..."
                {...field}
                value={field.value ?? ""}
                disabled={isSubmitting}
                rows={3}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <div className="p-4 bg-gray-50 rounded-md border border-gray-200">
        <h3 className="font-semibold text-lg">Resumen de la Cita</h3>
        <p className="text-sm">
          <span className="font-medium">Paciente:</span>{" "}
          {selectedPatientInForm?.nombre} {selectedPatientInForm?.apellido}
        </p>
        <p className="text-sm">
          <span className="font-medium">Administrador:</span>{" "}
          {
            administrators?.find(
              (a) => a.administrador_id === administradorIdValue
            )?.nombre
          }
        </p>
        <p className="text-sm">
          <span className="font-medium">Tipo de Atención:</span>{" "}
          {
            attentionTypes?.find(
              (t) => t.tipo_atencion_id === tipoAtencionIdValue
            )?.nombre_atencion
          }
        </p>
        {form.getValues("fecha_hora_cita") && (
          <p className="text-sm">
            <span className="font-medium">Fecha y Hora:</span>{" "}
            {DateTime.fromISO(form.getValues("fecha_hora_cita")!, {
              zone: "utc",
            })
              .setZone(CHILE_TIMEZONE)
              .toLocaleString(DateTime.DATETIME_SHORT)}
          </p>
        )}
        <p className="text-sm">
          <span className="font-medium">Notas:</span>{" "}
          {form.getValues("notas") || "Ninguna"}
        </p>
      </div>
    </div>
  );
};

export default NotesConfirmationStep;
