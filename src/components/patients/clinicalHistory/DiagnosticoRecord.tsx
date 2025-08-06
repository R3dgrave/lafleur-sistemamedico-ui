import type { Diagnostico } from "@/types";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export const DiagnosticoRecord: React.FC<{ diagnostico: Diagnostico }> = ({
  diagnostico,
}) => (
  <div className="space-y-1">
    <p className="text-sm font-semibold">Nombre del Diagnóstico:</p>
    <p className="text-gray-700 dark:text-gray-300">
      {diagnostico.nombre_diagnostico || "N/A"}
    </p>
    <p className="text-sm font-semibold mt-2">Código CIE:</p>
    <p className="text-gray-700 dark:text-gray-300">
      {diagnostico.codigo_cie || "N/A"}
    </p>
    <p className="text-sm font-semibold mt-2">Estado:</p>
    <p className="text-gray-700 dark:text-gray-300">
      {diagnostico.estado_diagnostico || "N/A"}
    </p>
    <p className="text-xs text-gray-500 mt-2">
      Registrado el:{" "}
      {format(new Date(diagnostico.fecha_registro), "dd/MM/yyyy HH:mm", {
        locale: es,
      })}
      {diagnostico.Cita &&
        ` (Cita ID: ${diagnostico.Cita.cita_id} - ${format(
          new Date(diagnostico.Cita.fecha_hora_cita),
          "dd/MM/yyyy HH:mm",
          { locale: es }
        )})`}
    </p>
  </div>
);