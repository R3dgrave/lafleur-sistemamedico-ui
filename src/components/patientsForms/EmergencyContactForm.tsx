import React from "react";
import { useForm, FormProvider } from "react-hook-form";
import type { UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import {
  createContactoEmergenciaSchema,
  updateContactoEmergenciaSchema,
} from "@/lib/validation";
import type {
  ContactoEmergencia,
  CreateContactoEmergenciaFormValues,
  UpdateContactoEmergenciaFormValues,
} from "../../types/index";

interface EmergencyContactFormProps {
  initialData?: ContactoEmergencia;
  pacienteRut?: string;
  onSubmit: (
    data:
      | CreateContactoEmergenciaFormValues
      | UpdateContactoEmergenciaFormValues
  ) => void;
  isSubmitting: boolean;
  onCancel: () => void;
}

const EmergencyContactForm: React.FC<EmergencyContactFormProps> = ({
  initialData,
  pacienteRut,
  onSubmit,
  isSubmitting,
  onCancel,
}) => {
  const formSchema = initialData
    ? updateContactoEmergenciaSchema
    : createContactoEmergenciaSchema;

  const form = useForm<
    CreateContactoEmergenciaFormValues | UpdateContactoEmergenciaFormValues
  >({
    resolver: zodResolver(formSchema),
    defaultValues: initialData
      ? {
        ...initialData,
        rut_paciente: pacienteRut || initialData.Paciente?.rut || "", // Usar el RUT del paciente si está disponible
      }
      : {
        rut_paciente: pacienteRut || "",
        nombre_contacto: "",
        telefono_contacto: "",
        relacion_paciente: "",
      },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="rut_paciente"
          render={({ field }) => (
            <FormItem>
              <FormLabel>RUT del Paciente</FormLabel>
              <FormControl>
                <Input
                  placeholder="RUT del paciente asociado"
                  {...field}
                  disabled={isSubmitting || !!pacienteRut}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="nombre_contacto"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre del Contacto</FormLabel>
              <FormControl>
                <Input
                  placeholder="Nombre del contacto de emergencia"
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
          name="telefono_contacto"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Teléfono del Contacto</FormLabel>
              <FormControl>
                <Input
                  placeholder="Ej: +56912345678"
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
          name="relacion_paciente"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Relación con el Paciente (opcional)</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={isSubmitting}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona la relación" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Padre/Madre">Padre/Madre</SelectItem>
                  <SelectItem value="Hijo/Hija">Hijo/Hija</SelectItem>
                  <SelectItem value="Cónyuge">Cónyuge</SelectItem>
                  <SelectItem value="Hermano/Hermana">
                    Hermano/Hermana
                  </SelectItem>
                  <SelectItem value="Amigo/Amiga">Amigo/Amiga</SelectItem>
                  <SelectItem value="Otro">Otro</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
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
              ? initialData
                ? "Guardando cambios..."
                : "Creando contacto..."
              : initialData
                ? "Guardar Cambios"
                : "Crear Contacto"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default EmergencyContactForm;
