import type { PlanTratamiento } from "@/types";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export const PlanTratamientoRecord: React.FC<{ plan: PlanTratamiento }> = ({
  plan,
}) => (
  <div className="space-y-1">
    <p className="text-sm font-semibold">Descripción del Plan:</p>
    <p className="text-gray-700 dark:text-gray-300">
      {plan.descripcion_plan || "N/A"}
    </p>
    <p className="text-sm font-semibold mt-2">Medicamentos Recetados:</p>
    <p className="text-gray-700 dark:text-gray-300">
      {plan.medicamentos_recetados || "N/A"}
    </p>
    <p className="text-sm font-semibold mt-2">Próxima Cita Recomendada:</p>
    <p className="text-gray-700 dark:text-gray-300">
      {plan.proxima_cita_recomendada
        ? format(new Date(plan.proxima_cita_recomendada), "dd/MM/yyyy", {
            locale: es,
          })
        : "N/A"}
    </p>
    <p className="text-xs text-gray-500 mt-2">
      Registrado el:{" "}
      {format(new Date(plan.fecha_registro), "dd/MM/yyyy HH:mm", {
        locale: es,
      })}
      {plan.Cita &&
        ` (Cita ID: ${plan.Cita.cita_id} - ${format(
          new Date(plan.Cita.fecha_hora_cita),
          "dd/MM/yyyy HH:mm",
          { locale: es }
        )})`}
    </p>
  </div>
);