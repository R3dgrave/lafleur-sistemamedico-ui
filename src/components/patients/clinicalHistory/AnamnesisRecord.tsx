// Componente para renderizar un registro de Anamnesis
import type { Anamnesis } from "@/types";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export const AnamnesisRecord: React.FC<{ anamnesis: Anamnesis }> = ({ anamnesis }) => (
  <div className="space-y-1">
    <p className="text-sm font-semibold">Motivo de Consulta:</p>
    <p className="text-gray-700 dark:text-gray-300">
      {anamnesis.motivo_consulta || "N/A"}
    </p>
    <p className="text-sm font-semibold mt-2">Antecedentes Personales:</p>
    <p className="text-gray-700 dark:text-gray-300">
      {anamnesis.antecedentes_personales || "N/A"}
    </p>
    <p className="text-xs text-gray-500 mt-2">
      Registrado el:{" "}
      {format(new Date(anamnesis.fecha_registro), "dd/MM/yyyy HH:mm", {
        locale: es,
      })}
      {anamnesis.Cita &&
        ` (Cita ID: ${anamnesis.Cita.cita_id} - ${format(
          new Date(anamnesis.Cita.fecha_hora_cita),
          "dd/MM/yyyy HH:mm",
          { locale: es }
        )})`}
    </p>
  </div>
);