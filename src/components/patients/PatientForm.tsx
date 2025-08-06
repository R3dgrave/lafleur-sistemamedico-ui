// src/componets/patients/PatientForm.tsx
import React, { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import type { ControllerRenderProps } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createPacienteSchema, updatePacienteSchema } from "@/lib/validation";
import type {
  Paciente,
  CreatePacienteFormValues,
  UpdatePacienteFormValues,
  BackendError,
} from "@/types";
import { formatRut, formatPhoneNumber } from "@/lib/formatters";

interface PatientFormProps {
  initialData?: Paciente;
  onSubmit: (data: CreatePacienteFormValues | UpdatePacienteFormValues) => void;
  isSubmitting: boolean;
  onCancel: () => void;
  backendErrors?: BackendError[];
}

const PatientForm: React.FC<PatientFormProps> = ({
  initialData,
  onSubmit,
  isSubmitting,
  onCancel,
  backendErrors,
}) => {
  const isEditing = useMemo(() => !!initialData, [initialData]);
  const formSchema = isEditing ? updatePacienteSchema : createPacienteSchema;

  const form = useForm<CreatePacienteFormValues | UpdatePacienteFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: isEditing
      ? {
          nombre: initialData?.nombre || "",
          apellido: initialData?.apellido || "",
          fecha_nacimiento: initialData?.fecha_nacimiento || "",
          genero: initialData?.genero || undefined,
          identidad_genero: initialData?.identidad_genero || "",
          sexo_registral: initialData?.sexo_registral || "",
          telefono: initialData?.telefono || "",
          email: initialData?.email || "",
          direccion: initialData?.direccion || "",
          rut: initialData?.rut || "",
        }
      : {
          nombre: "",
          apellido: "",
          fecha_nacimiento: "",
          genero: undefined,
          email: "",
          identidad_genero: "",
          sexo_registral: "",
          telefono: "",
          direccion: "",
          rut: "",
        },
  });

  // Efecto para mapear errores del backend a errores del formulario
  useEffect(() => {
    if (backendErrors && backendErrors.length > 0) {
      form.clearErrors();
      backendErrors.forEach((error) => {
        const fieldName = error.path.join(".") as keyof (
          | CreatePacienteFormValues
          | UpdatePacienteFormValues
        );
        form.setError(fieldName, {
          type: "manual",
          message: error.message,
        });
      });
    } else {
      form.clearErrors();
    }
  }, [backendErrors, form]);

  const formFields = [
    { name: "nombre", label: "Nombre", placeholder: "Nombre del paciente" },
    { name: "apellido", label: "Apellido", placeholder: "Apellido del paciente" },
    { name: "rut", label: "RUT", placeholder: "Ej: 12.345.678-9", disabled: isEditing, onBlur: (field: ControllerRenderProps<any, any>) => handleRutBlur(field) },
    { name: "email", label: "Email", placeholder: "ejemplo@dominio.com", type: "email" },
    { name: "telefono", label: "Teléfono", placeholder: "Ej: 9 1234 5678", onBlur: (field: ControllerRenderProps<any, any>) => handlePhoneBlur(field) },
    { name: "direccion", label: "Dirección", placeholder: "Calle, número, comuna, ciudad" },
    { name: "identidad_genero", label: "Identidad de Género (opcional)", placeholder: "Identidad de género" },
    { name: "sexo_registral", label: "Sexo Registral (opcional)", placeholder: "Sexo registral" },
  ];

  const handleRutBlur = (field: ControllerRenderProps<any, any>) => {
    const currentRut = field.value;
    if (currentRut) {
      field.onChange(formatRut(currentRut));
    }
  };

  const handlePhoneBlur = (field: ControllerRenderProps<any, any>) => {
    const currentPhone = field.value;
    if (currentPhone) {
      field.onChange(formatPhoneNumber(currentPhone));
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {formFields.map((fieldConfig) => (
            <FormField
              key={fieldConfig.name}
              control={form.control}
              name={
                fieldConfig.name as keyof (
                  | CreatePacienteFormValues
                  | UpdatePacienteFormValues
                )
              }
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{fieldConfig.label}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type={fieldConfig.type || "text"}
                      placeholder={fieldConfig.placeholder}
                      disabled={isSubmitting || fieldConfig.disabled}
                      onBlur={() => {
                        field.onBlur();
                        fieldConfig.onBlur?.(field);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}

          <FormField
            control={form.control}
            name="fecha_nacimiento"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Fecha de Nacimiento</FormLabel>
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
                          format(new Date(field.value), "PPP", { locale: es })
                        ) : (
                          <span>Selecciona una fecha</span>
                        )}
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value ? new Date(field.value) : undefined}
                      onSelect={(date) => {
                        field.onChange(date ? format(date, "yyyy-MM-dd") : "");
                      }}
                      initialFocus
                      locale={es}
                      disabled={(date) => date > new Date()}
                      captionLayout="dropdown"
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="genero"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Género</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value || ""}
                  disabled={isSubmitting}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona el género" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Masculino">Masculino</SelectItem>
                    <SelectItem value="Femenino">Femenino</SelectItem>
                    <SelectItem value="No Binario">No Binario</SelectItem>
                    <SelectItem value="Otro">Otro</SelectItem>
                    <SelectItem value="Prefiero no decir">
                      Prefiero no decir
                    </SelectItem>
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
            {isSubmitting
              ? isEditing
                ? "Guardando..."
                : "Creando..."
              : isEditing
              ? "Guardar Cambios"
              : "Crear Paciente"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default PatientForm;
