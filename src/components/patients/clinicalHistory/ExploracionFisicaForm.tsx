import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
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
import { exploracionFisicaFormSchema } from "../../../lib/validation";

// Tipos
import type {
  ExploracionFisica,
  Cita,
  CreateExploracionFisicaData,
  UpdateExploracionFisicaData,
} from "@/types";
import { Loader2 } from "lucide-react";

interface ExploracionFisicaFormProps {
  initialData?: ExploracionFisica | null;
  onSubmit: (
    data: CreateExploracionFisicaData | UpdateExploracionFisicaData
  ) => void;
  onCancel: () => void;
  isSubmitting: boolean;
  patientAppointments: Cita[];
}

const ExploracionFisicaForm: React.FC<ExploracionFisicaFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting,
  patientAppointments,
}) => {
  const isEditing = !!initialData;

  const form = useForm<
    CreateExploracionFisicaData | UpdateExploracionFisicaData
  >({
    resolver: zodResolver(exploracionFisicaFormSchema),
    defaultValues: {
      cita_id: initialData?.cita_id ?? null,
      hallazgos: initialData?.hallazgos || "",
      region_explorada: initialData?.region_explorada || "",
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
            name="hallazgos"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Hallazgos</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Describe los hallazgos de la exploración física..."
                    {...field}
                    value={field.value ?? ""}
                    disabled={isSubmitting}
                    rows={6}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="region_explorada"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Región Explorada (Opcional)</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ej: General, Abdominal, Ginecológica, Cabeza y Cuello"
                    {...field}
                    value={field.value ?? ""}
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormDescription>
                  Puedes especificar la región del cuerpo explorada.
                </FormDescription>
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
              "Crear Exploración"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ExploracionFisicaForm;
