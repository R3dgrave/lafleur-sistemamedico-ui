// Componente PruebasInicialesForm.tsx corregido
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type {
  PruebasIniciales,
  CreatePruebasInicialesData,
  UpdatePruebasInicialesData,
  Cita,
} from "@/types";
import { pruebasInicialesFormSchema } from "@/lib/validation";

interface PruebasInicialesFormProps {
  initialData?: PruebasIniciales | null;
  onSubmit: (
    data: CreatePruebasInicialesData | UpdatePruebasInicialesData
  ) => void;
  onCancel: () => void;
  isSubmitting: boolean;
  patientAppointments: Cita[];
}

// 1. Se crea un TIPO INTERMEDIO para el formulario.
// Todos los campos que provienen de inputs serán de tipo string.
// Se soluciona la incompatibilidad de tipos con `useForm`.
const formSchema = pruebasInicialesFormSchema;
type FormValues = z.infer<typeof formSchema>;

const PruebasInicialesForm: React.FC<PruebasInicialesFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting,
}) => {
  const isEditing = !!initialData;

  // 2. Inicializar `useForm` con el tipo correcto `FormValues`.
  const form = useForm<FormValues>({
    resolver: zodResolver(pruebasInicialesFormSchema),
    defaultValues: {
      // CORRECCIÓN: Eliminar 'imc' de los valores por defecto
      // porque es un valor calculado, no un campo del formulario.
      peso: initialData?.peso?.toString() ?? "",
      altura: initialData?.altura?.toString() ?? "",
      perimetro_cintura: initialData?.perimetro_cintura?.toString() ?? "",
      perimetro_cadera: initialData?.perimetro_cadera?.toString() ?? "",
      presion_sistolica: initialData?.presion_sistolica?.toString() ?? "",
      presion_diastolica: initialData?.presion_diastolica?.toString() ?? "",
      frecuencia_cardiaca: initialData?.frecuencia_cardiaca?.toString() ?? "",
      temperatura: initialData?.temperatura?.toString() ?? "",
      saturacion_oxigeno: initialData?.saturacion_oxigeno?.toString() ?? "",
      notas_adicionales: initialData?.notas_adicionales ?? "",
    },
  });

  // Función para calcular el IMC automáticamente.
  const calculateIMC = () => {
    // CORRECCIÓN: Obtener los valores y convertirlos a número de forma segura.
    // Usamos `getValues` para obtener los valores del formulario.
    const pesoString = form.getValues("peso");
    const alturaString = form.getValues("altura");

    // Convertimos los strings a números de forma segura con `parseFloat`.
    // Si el valor es null, undefined, o un string vacío, parseFloat devuelve NaN.
    const peso = parseFloat(pesoString!);
    const altura = parseFloat(alturaString!);

    // Verificamos si los valores son números válidos antes de calcular
    // y si la altura es mayor que cero para evitar divisiones por cero.
    if (!isNaN(peso) && !isNaN(altura) && altura > 0) {
      // La altura debe estar en metros para el cálculo.
      const imc = peso / Math.pow(altura / 100, 2);
      return imc.toFixed(2);
    }
    return "N/A";
  };

  // Función que se llama al enviar el formulario
  const handleFormSubmit = (values: FormValues) => {
    // Crear el objeto con los datos finales, convirtiendo de string a number | null.
    const submittedData: CreatePruebasInicialesData | UpdatePruebasInicialesData = {
      peso: values.peso ? parseFloat(values.peso) : null,
      altura: values.altura ? parseFloat(values.altura) : null,
      // CORRECCIÓN: Calcular el IMC aquí y asignarlo al objeto de envío.
      // Así se envía el valor calculado a la base de datos, no desde el estado del formulario.
      imc: calculateIMC() !== "N/A" ? parseFloat(calculateIMC()) : null,
      perimetro_cintura: values.perimetro_cintura ? parseFloat(values.perimetro_cintura) : null,
      perimetro_cadera: values.perimetro_cadera ? parseFloat(values.perimetro_cadera) : null,
      presion_sistolica: values.presion_sistolica ? parseFloat(values.presion_sistolica) : null,
      presion_diastolica: values.presion_diastolica ? parseFloat(values.presion_diastolica) : null,
      frecuencia_cardiaca: values.frecuencia_cardiaca ? parseFloat(values.frecuencia_cardiaca) : null,
      temperatura: values.temperatura ? parseFloat(values.temperatura) : null,
      saturacion_oxigeno: values.saturacion_oxigeno ? parseFloat(values.saturacion_oxigeno) : null,
      notas_adicionales: values.notas_adicionales,
    } as CreatePruebasInicialesData | UpdatePruebasInicialesData;
    
    onSubmit(submittedData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="peso"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Peso (kg)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Ej: 75.5"
                    {...field}
                    value={field.value ?? ""} 
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="altura"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Altura (cm)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Ej: 175"
                    {...field}
                    value={field.value ?? ""} 
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col space-y-2">
            <FormLabel>IMC (Calculado)</FormLabel>
            <Input
              value={calculateIMC()}
              disabled
              className="bg-gray-100 dark:bg-gray-700"
            />
            <FormDescription>Calculado automáticamente.</FormDescription>
          </div>
          <FormField
            control={form.control}
            name="perimetro_cintura"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Perímetro de Cintura (cm)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Ej: 85.0"
                    {...field}
                    value={field.value ?? ""} 
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="presion_sistolica"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Presión Sistólica (mmHg)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Ej: 120"
                    {...field}
                    value={field.value ?? ""}
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="presion_diastolica"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Presión Diastólica (mmHg)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Ej: 80"
                    {...field}
                    value={field.value ?? ""}
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="perimetro_cadera"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Perímetro de Cadera (cm)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Ej: 95.0"
                    {...field}
                    value={field.value ?? ""}
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="frecuencia_cardiaca"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Frecuencia Cardíaca (lpm)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Ej: 75"
                    {...field}
                    value={field.value ?? ""}
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="temperatura"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Temperatura (°C)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="Ej: 36.5"
                    {...field}
                    value={field.value ?? ""}
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="saturacion_oxigeno"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Saturación de Oxígeno (%)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Ej: 98.50"
                    {...field}
                    value={field.value ?? ""}
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="notas_adicionales"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notas Adicionales</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Comentarios adicionales del médico."
                  {...field}
                  value={field.value ?? ""}
                  disabled={isSubmitting}
                  rows={3}
                />
              </FormControl>
              <FormDescription>
                Cualquier nota o interpretación relevante.
              </FormDescription>
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
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : isEditing ? (
              "Guardar Cambios"
            ) : (
              "Crear Registro"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default PruebasInicialesForm;
