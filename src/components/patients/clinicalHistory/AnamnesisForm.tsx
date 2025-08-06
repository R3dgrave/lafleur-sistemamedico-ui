import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  Anamnesis,
  Cita,
  CreateAnamnesisData,
  UpdateAnamnesisData,
} from "@/types";
import { Loader2 } from "lucide-react";
import { anamnesisFormSchema } from "../../../lib/validation";

interface AnamnesisFormProps {
  initialData?: Anamnesis | null;
  onSubmit: (data: CreateAnamnesisData | UpdateAnamnesisData) => void;
  onCancel: () => void;
  isSubmitting: boolean;
  patientAppointments: Cita[];
}

const AnamnesisForm: React.FC<AnamnesisFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting,
  patientAppointments,
}) => {
  const isEditing = !!initialData;

  const form = useForm<CreateAnamnesisData | UpdateAnamnesisData>({
    resolver: zodResolver(anamnesisFormSchema),
    defaultValues: {
      cita_id: initialData?.cita_id ?? null,
      motivo_consulta: initialData?.motivo_consulta || "",
      antecedentes_personales: initialData?.antecedentes_personales || "",
      antecedentes_familiares: initialData?.antecedentes_familiares || "",
      medicamentos_actuales: initialData?.medicamentos_actuales || "",
      alergias: initialData?.alergias || "",
      otros_antecedentes: initialData?.otros_antecedentes || "",
      aqx: initialData?.aqx || "",
      amp: initialData?.amp || "",
      habitos_tabaco: initialData?.habitos_tabaco ?? false,
      habitos_alcohol: initialData?.habitos_alcohol ?? false,
      habitos_alimentacion: initialData?.habitos_alimentacion || "",
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
            name="motivo_consulta"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Motivo de Consulta</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Breve descripción del motivo de la consulta..."
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
            name="antecedentes_personales"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Antecedentes Personales</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enfermedades previas, cirugías, hospitalizaciones..."
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
            name="antecedentes_familiares"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Antecedentes Familiares</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enfermedades relevantes en la familia (diabetes, hipertensión, cáncer, etc.)..."
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
            name="medicamentos_actuales"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Medicamentos Actuales</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Lista de medicamentos que el paciente está tomando actualmente..."
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
            name="alergias"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Alergias</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Alergias conocidas (medicamentos, alimentos, etc.)..."
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
            name="aqx"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Antecedentes Quirúrgicos (AQx)</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Cirugías previas y fechas aproximadas..."
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
            name="amp"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Antecedentes Médicos Personales (AMP)</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Condiciones médicas crónicas, enfermedades pasadas no quirúrgicas..."
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
            name="habitos_tabaco"
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
                  <FormLabel>Hábito de Tabaco</FormLabel>
                  <FormDescription>
                    Marcar si el paciente tiene hábito de tabaco.
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="habitos_alcohol"
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
                  <FormLabel>Hábito de Alcohol</FormLabel>
                  <FormDescription>
                    Marcar si el paciente tiene hábito de alcohol.
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="habitos_alimentacion"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Hábitos de Alimentación</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Descripción de los hábitos alimenticios del paciente..."
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
            name="otros_antecedentes"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Otros Antecedentes Relevantes</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Cualquier otra información relevante no cubierta en las secciones anteriores..."
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
              "Crear Anamnesis"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default AnamnesisForm;
