import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Tipos
import type {
  Diagnostico,
  Cita,
  CreateDiagnosticoData,
  UpdateDiagnosticoData,
} from "@/types";
import { diagnosticoFormSchema } from "../../../lib/validation";

interface DiagnosticoFormProps {
  initialData?: Diagnostico | null;
  onSubmit: (data: CreateDiagnosticoData | UpdateDiagnosticoData) => void;
  onCancel: () => void;
  isSubmitting: boolean;
  patientAppointments: Cita[];
}

const DiagnosticoForm: React.FC<DiagnosticoFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting,
  patientAppointments,
}) => {
  const isEditing = !!initialData;

  type DiagnosticoFormValues = z.infer<typeof diagnosticoFormSchema>;

  const form = useForm<DiagnosticoFormValues>({
    resolver: zodResolver(diagnosticoFormSchema),
    defaultValues: {
      cita_id: initialData?.cita_id ?? null,
      codigo_cie: initialData?.codigo_cie ?? "",
      nombre_diagnostico: initialData?.nombre_diagnostico ?? "",
      descripcion: initialData?.descripcion ?? "",
      es_principal: initialData?.es_principal ?? false,
      estado_diagnostico: initialData?.estado_diagnostico ?? "Activo",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="cita_id"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Vincular a Cita (Opcional)</FormLabel>
                <Select
                  onValueChange={(value) => {
                    field.onChange(value === "null" ? null : Number(value));
                  }}
                  value={field.value === null ? "null" : String(field.value)}
                  disabled={isSubmitting}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona una cita o no vincular" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="null">No vincular a una cita</SelectItem>
                    {patientAppointments.length > 0 ? (
                      patientAppointments.map((cita) => (
                        <SelectItem
                          key={cita.cita_id}
                          value={String(cita.cita_id)}
                        >
                          Cita ID: {cita.cita_id} -{" "}
                          {format(
                            new Date(cita.fecha_hora_cita),
                            "dd/MM/yyyy HH:mm",
                            {
                              locale: es,
                            }
                          )}{" "}
                          (Estado: {cita.estado_cita})
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-appointments" disabled>
                        No hay citas pendientes para este paciente.
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="codigo_cie"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Código CIE (Opcional)</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ej: I10 (Hipertensión esencial)"
                    {...field}
                    value={field.value ?? ""}
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormDescription>
                  Código de la Clasificación Internacional de Enfermedades.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="nombre_diagnostico"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre del Diagnóstico</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ej: Hipertensión Arterial, Diabetes Mellitus Tipo 2"
                    {...field}
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="descripcion"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Descripción (Opcional)</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Detalles adicionales sobre el diagnóstico, criterios, etc."
                    {...field}
                    value={field.value ?? ""}
                    disabled={isSubmitting}
                    rows={4}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="es_principal"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={isSubmitting}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Diagnóstico Principal</FormLabel>
                  <FormDescription>
                    Marcar si este es el diagnóstico principal de la consulta o
                    del paciente.
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="estado_diagnostico"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Estado del Diagnóstico</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value || "Activo"}
                  disabled={isSubmitting}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona el estado" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Activo">Activo</SelectItem>
                    <SelectItem value="Resuelto">Resuelto</SelectItem>
                    <SelectItem value="Crónico">Crónico</SelectItem>
                    <SelectItem value="Inactivo">Inactivo</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : isEditing ? (
              "Guardar Cambios"
            ) : (
              "Crear Diagnóstico"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default DiagnosticoForm;
