import React from "react";
import type { UseFormReturn } from "react-hook-form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import type {
  Administrador,
  TipoAtencion,
  CreateCitaFormValues,
  UpdateCitaFormValues,
} from "@/types";

interface DetailsStepProps {
  form: UseFormReturn<CreateCitaFormValues | UpdateCitaFormValues>;
  administrators: Administrador[];
  isLoadingAdministrators: boolean;
  attentionTypes: TipoAtencion[] | undefined;
  isLoadingAttentionTypes: boolean;
  handleAdministratorSelectChange: (value: string) => void;
  handleAttentionTypeSelectChange: (value: string) => void;
  isSubmitting: boolean;
}

const DetailsStep: React.FC<DetailsStepProps> = ({
  form,
  administrators,
  isLoadingAdministrators,
  attentionTypes,
  isLoadingAttentionTypes,
  handleAdministratorSelectChange,
  handleAttentionTypeSelectChange,
  isSubmitting,
}) => {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">2. Detalles de la Cita</h2>
      <FormField
        control={form.control}
        name="administrador_id"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Administrador</FormLabel>
            <Select
              onValueChange={handleAdministratorSelectChange}
              value={
                field.value !== undefined && field.value !== null
                  ? String(field.value)
                  : ""
              }
              disabled={isSubmitting || isLoadingAdministrators}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un administrador" />
              </SelectTrigger>
              <SelectContent>
                {isLoadingAdministrators ? (
                  <SelectItem disabled value="">
                    Cargando administradores...
                  </SelectItem>
                ) : (
                  administrators?.map((admin) =>
                    admin.administrador_id !== undefined &&
                    admin.administrador_id !== null &&
                    typeof admin.administrador_id === "number" ? (
                      <SelectItem
                        key={admin.administrador_id}
                        value={admin.administrador_id.toString()}
                      >
                        {admin.nombre} {admin.apellido}
                      </SelectItem>
                    ) : null
                  )
                )}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="tipo_atencion_id"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Tipo de Atención</FormLabel>
            <Select
              onValueChange={handleAttentionTypeSelectChange}
              value={field.value?.toString() || ""}
              disabled={isSubmitting || isLoadingAttentionTypes}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un tipo de atención" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {isLoadingAttentionTypes ? (
                  <SelectItem value="loading-attention-types" disabled>
                    Cargando tipos de atención...
                  </SelectItem>
                ) : (
                  attentionTypes?.map((type) => (
                    <SelectItem
                      key={type.tipo_atencion_id}
                      value={type.tipo_atencion_id.toString()}
                    >
                      {type.nombre_atencion} ({type.duracion_minutos} min)
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default DetailsStep;
