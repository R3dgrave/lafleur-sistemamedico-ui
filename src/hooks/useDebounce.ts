import { useState, useEffect } from "react";

/**
 * Hook personalizado para "rebotar" un valor, retrasando su actualización
 * hasta que un período de tiempo especificado haya transcurrido sin cambios.
 *
 * útil para optimizar llamadas a APIs o acciones costosas
 * que no deberían ejecutarse en cada pulsación de tecla.
 *
 * @param value El valor a "rebotar" (por ejemplo, el texto de un input).
 * @param delay El retraso en milisegundos antes de actualizar el valor final.
 * @returns El valor final "rebotado".
 */
export const useDebounce = <T>(value: T, delay: number): T => {
  // Estado para almacenar el valor "rebotado"
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    // La función de limpieza se ejecuta en cada re-render y antes de que se desmonte el componente.
    // Esto asegura que el temporizador se reinicie si el valor cambia antes de que se dispare.
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]); // Solo ejecuta el efecto si el valor o el retraso cambian

  return debouncedValue;
};
