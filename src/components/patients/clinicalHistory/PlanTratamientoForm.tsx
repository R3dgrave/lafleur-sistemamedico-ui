import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Loader2, CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import type {
  PlanTratamiento,
  Cita,
  CreatePlanTratamientoData,
  UpdatePlanTratamientoData,
} from "@/types";
import { planTratamientoFormSchema } from "@/lib/validation";

// Propiedades del componente del formulario
interface PlanTratamientoFormProps {
  initialData?: PlanTratamiento | null;
  onSubmit: (
    data: CreatePlanTratamientoData | UpdatePlanTratamientoData
  ) => void;
  onCancel: () => void;
  isSubmitting: boolean;
  patientAppointments: Cita[];
}

const PlanTratamientoForm: React.FC<PlanTratamientoFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting,
  patientAppointments,
}) => {
  const isEditing = !!initialData;
  const defaultValues = {
    cita_id: initialData?.cita_id,
    descripcion_plan: initialData?.descripcion_plan || "",
    medicamentos_recetados: initialData?.medicamentos_recetados,
    indicaciones_adicionales: initialData?.indicaciones_adicionales,
    proxima_cita_recomendada: initialData?.proxima_cita_recomendada,
    receta_adjunta_url: initialData?.receta_adjunta_url,
  };

  const form = useForm<z.infer<typeof planTratamientoFormSchema>>({
    resolver: zodResolver(planTratamientoFormSchema),
    defaultValues: defaultValues,
  });

  const proximaCitaRecomendadaValue = form.watch("proxima_cita_recomendada");
  const selectedProximaCita = proximaCitaRecomendadaValue
    ? new Date(proximaCitaRecomendadaValue)
    : undefined;

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
                            { locale: es }
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
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="descripcion_plan"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Descripción del Plan</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Detalles del plan de tratamiento, objetivos, etc."
                    {...field}
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
            name="medicamentos_recetados"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Medicamentos Recetados (Opcional)</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Lista de medicamentos, dosis, frecuencia..."
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

          <FormField
            control={form.control}
            name="indicaciones_adicionales"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Indicaciones Adicionales (Opcional)</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Instrucciones para el paciente, cambios en el estilo de vida, etc."
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

          <FormField
            control={form.control}
            name="proxima_cita_recomendada"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Próxima Cita Recomendada (Opcional)</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                        disabled={isSubmitting}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4 opacity-50" />
                        {field.value ? (
                          format(selectedProximaCita!, "PPP", { locale: es })
                        ) : (
                          <span>Selecciona una fecha</span>
                        )}
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={selectedProximaCita}
                      onSelect={(date) => {
                        // Ahora enviamos `undefined` si no hay fecha,
                        // lo que coincide con el esquema sin el .transform
                        field.onChange(
                          date ? format(date, "yyyy-MM-dd") : undefined
                        );
                      }}
                      initialFocus
                      locale={es}
                      disabled={(date) => date < new Date()}
                    />
                  </PopoverContent>
                </Popover>
                <FormDescription>
                  Fecha sugerida para la próxima consulta de seguimiento.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="receta_adjunta_url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>URL de Receta Adjunta (Opcional)</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ej: https://ejemplo.com/receta.pdf"
                    {...field}
                    value={field.value ?? ""}
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormDescription>
                  Enlace a un documento externo (ej. PDF de receta médica).
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
              "Crear Plan"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default PlanTratamientoForm;
