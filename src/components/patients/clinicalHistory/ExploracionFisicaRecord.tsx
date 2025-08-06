import { format } from "date-fns";
import { es } from "date-fns/locale";
import type { ExploracionFisica } from "@/types";

export const ExploracionFisicaRecord: React.FC<{ exploracion: ExploracionFisica }> = ({
  exploracion,
}) => (
  <div className="space-y-1">
    <p className="text-sm font-semibold">Región Explorada:</p>
    <p className="text-gray-700 dark:text-gray-300">
      {exploracion.region_explorada || "N/A"}
    </p>
    <p className="text-sm font-semibold mt-2">Hallazgos:</p>
    <p className="text-gray-700 dark:text-gray-300">
      {exploracion.hallazgos || "N/A"}
    </p>
    <p className="text-xs text-gray-500 mt-2">
      Registrado el:{" "}
      {format(new Date(exploracion.fecha_registro), "dd/MM/yyyy HH:mm", {
        locale: es,
      })}
      {exploracion.Cita &&
        ` (Cita ID: ${exploracion.Cita.cita_id} - ${format(
          new Date(exploracion.Cita.fecha_hora_cita),
          "dd/MM/yyyy HH:mm",
          { locale: es }
        )})`}
    </p>
  </div>
);