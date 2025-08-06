import type { PruebasIniciales } from "@/types";
import { Label } from "@radix-ui/react-label";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export const PruebasInicialesRecord: React.FC<{ pruebas: PruebasIniciales }> = ({
  pruebas,
}) => {
  const imcValue = parseFloat(String(pruebas.imc));

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="space-y-1">
        <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          Peso:
        </Label>
        <p>{pruebas.peso ? `${pruebas.peso} kg` : "N/A"}</p>
      </div>
      <div className="space-y-1">
        <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          Altura:
        </Label>
        <p>{pruebas.altura ? `${pruebas.altura} cm` : "N/A"}</p>
      </div>
      <div className="space-y-1">
        <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          IMC:
        </Label>
        {/* Ahora usamos la constante imcValue que definimos arriba */}
        <p>{!isNaN(imcValue) ? imcValue.toFixed(2) : "N/A"}</p>
      </div>
      <div className="space-y-1">
        <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          Presión Arterial:
        </Label>
        <p>
          {pruebas.presion_sistolica && pruebas.presion_diastolica
            ? `${pruebas.presion_sistolica}/${pruebas.presion_diastolica} mmHg`
            : "N/A"}
        </p>
      </div>
      <div className="space-y-1">
        <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          Frecuencia Cardiaca:
        </Label>
        <p>
          {pruebas.frecuencia_cardiaca
            ? `${pruebas.frecuencia_cardiaca} lpm`
            : "N/A"}
        </p>
      </div>
      <div className="space-y-1">
        <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          Temperatura:
        </Label>
        <p>{pruebas.temperatura ? `${pruebas.temperatura} °C` : "N/A"}</p>
      </div>
      <div className="space-y-1 col-span-1 sm:col-span-2">
        <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          Saturación de Oxígeno:
        </Label>
        <p>
          {pruebas.saturacion_oxigeno
            ? `${pruebas.saturacion_oxigeno} %`
            : "N/A"}
        </p>
      </div>
      <p className="text-xs text-gray-500 mt-2 col-span-1 sm:col-span-2">
        Registrado el:{" "}
        {format(new Date(pruebas.fecha_registro), "dd/MM/yyyy HH:mm", {
          locale: es,
        })}
        {pruebas.Cita &&
          ` (Cita ID: ${pruebas.Cita.cita_id} - ${format(
            new Date(pruebas.Cita.fecha_hora_cita),
            "dd/MM/yyyy HH:mm",
            { locale: es }
          )})`}
      </p>
    </div>
  );
};