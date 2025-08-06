import React from "react";
import type { UseFormReturn } from "react-hook-form";
import { format, isValid } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { DateTime } from "luxon";
import { es } from "date-fns/locale";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import type {
  TimeSlot,
  CreateCitaFormValues,
  UpdateCitaFormValues,
} from "@/types";

const CHILE_TIMEZONE = "America/Santiago";

interface DateTimeStepProps {
  form: UseFormReturn<CreateCitaFormValues | UpdateCitaFormValues>;
  selectedDate: Date | undefined;
  availableTimes: TimeSlot[] | undefined;
  isLoadingAvailableTimes: boolean;
  isErrorSlots: boolean;
  slotsError: Error | null;
  canShowSlots: boolean;
  handleDateSelect: (date: Date | undefined) => void;
  handleTimeSelect: (isoTimeString: string) => void;
  isSubmitting: boolean;
}

const DateTimeStep: React.FC<DateTimeStepProps> = ({
  form,
  selectedDate,
  availableTimes,
  isLoadingAvailableTimes,
  isErrorSlots,
  slotsError,
  canShowSlots,
  handleDateSelect,
  handleTimeSelect,
  isSubmitting,
}) => {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">3. Fecha y Hora</h2>
      <FormField
        control={form.control}
        name="fecha_hora_cita"
        render={({ }) => (
          <FormItem className="flex flex-col">
            <FormLabel>Fecha de la Cita</FormLabel>
            <Popover>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    type="button"
                    variant={"outline"}
                    className={cn(
                      "w-full pl-3 text-left font-normal",
                      !selectedDate && "text-muted-foreground"
                    )}
                    disabled={isSubmitting}
                  >
                    {selectedDate && isValid(selectedDate) ? (
                      format(selectedDate, "PPP", { locale: es })
                    ) : (
                      <span>Selecciona fecha</span>
                    )}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleDateSelect}
                  initialFocus
                  locale={es}
                  disabled={(date) =>
                    date < new Date(new Date().setHours(0, 0, 0, 0)) ||
                    date >
                      new Date(new Date().setMonth(new Date().getMonth() + 6))
                  }
                />
              </PopoverContent>
            </Popover>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormItem>
        <Label htmlFor="time-slots-create">Horas Disponibles</Label>
        {!canShowSlots ? (
          <p className="text-gray-500 text-sm">
            Selecciona un administrador, tipo de atención y fecha para ver las
            horas.
          </p>
        ) : isLoadingAvailableTimes ? (
          <p className="text-sm">Cargando horas disponibles...</p>
        ) : isErrorSlots ? (
          <p className="text-red-500 text-sm">
            Error al cargar horas: {slotsError?.message}
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto">
            {availableTimes && availableTimes.length > 0 ? (
              availableTimes.map((slot: TimeSlot) => {
                const slotStartLocal = DateTime.fromISO(slot.start, {
                  zone: "utc",
                }).setZone(CHILE_TIMEZONE);
                const slotEndLocal = DateTime.fromISO(slot.end, {
                  zone: "utc",
                }).setZone(CHILE_TIMEZONE);
                const displayTime = `${slotStartLocal.toLocaleString(
                  DateTime.TIME_24_SIMPLE
                )} - ${slotEndLocal.toLocaleString(DateTime.TIME_24_SIMPLE)}`;
                const isSelected =
                  form.getValues("fecha_hora_cita") === slot.start;
                return (
                  <Button
                    key={slot.start}
                    type="button"
                    variant={isSelected ? "default" : "outline"}
                    onClick={() => handleTimeSelect(slot.start)}
                    className="justify-center"
                    disabled={isSubmitting}
                  >
                    {displayTime}
                  </Button>
                );
              })
            ) : (
              <p className="text-gray-500 text-sm col-span-2">
                No hay franjas horarias disponibles.
              </p>
            )}
          </div>
        )}
      </FormItem>
    </div>
  );
};

export default DateTimeStep;
