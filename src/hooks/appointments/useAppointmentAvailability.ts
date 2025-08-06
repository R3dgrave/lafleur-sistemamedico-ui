import { useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { DateTime } from 'luxon';
import { isValid, parseISO } from 'date-fns';
import { availabilityService } from '@/services/availabilityService';
import { administratorService } from '@/services/administratorService';
import { attentionTypeService } from '@/services/attentionTypeService';
import type { Administrador, TipoAtencion, TimeSlot, Cita } from '@/types';
import type { UseFormReturn } from 'react-hook-form';

const CHILE_TIMEZONE = 'America/Santiago';

interface UseAppointmentAvailabilityProps {
    form: UseFormReturn<any>;
    initialData?: Cita;
    isSubmitting: boolean;
}

interface UseAppointmentAvailabilityResult {
    selectedDate: Date | undefined;
    selectedDateStringForAPI: string | undefined;
    tipoAtencionIdValue: number | undefined;
    administradorIdValue: number | undefined;
    administrators: Administrador[] | undefined;
    isLoadingAdministrators: boolean;
    attentionTypes: TipoAtencion[] | undefined;
    isLoadingAttentionTypes: boolean;
    availableTimes: TimeSlot[] | undefined;
    isLoadingAvailableTimes: boolean;
    isErrorSlots: boolean;
    slotsError: Error | null;
    canShowSlots: boolean;
    handleDateSelect: (date: Date | undefined) => void;
    handleTimeSelect: (isoTimeString: string) => void;
    handleAttentionTypeSelectChange: (value: string) => void;
    handleAdministratorSelectChange: (value: string) => void;
}

export const useAppointmentAvailability = ({ form, initialData }: UseAppointmentAvailabilityProps): UseAppointmentAvailabilityResult => {
    const fechaHoraCitaValue = form.watch('fecha_hora_cita');
    const tipoAtencionIdValue = form.watch('tipo_atencion_id');
    const administradorIdValue = form.watch('administrador_id');

    // Deriva selectedDate (objeto Date) para el calendario
    const selectedDate = fechaHoraCitaValue && isValid(parseISO(fechaHoraCitaValue))
        ? parseISO(fechaHoraCitaValue)
        : undefined;

    // Deriva selectedDateStringForAPI (YYYY-MM-DD) para la API
    const selectedDateStringForAPI = selectedDate
        ? DateTime.fromJSDate(selectedDate, { zone: CHILE_TIMEZONE }).toISODate() || undefined
        : undefined;

    // Carga de administradores: Usamos una queryKey más genérica para consistencia.
    const { data: administrators, isLoading: isLoadingAdministrators } = useQuery<Administrador[], Error>({
        queryKey: ['administrators'],
        queryFn: administratorService.getAll,
    });

    // Fetch de tipos de atención: Usamos una queryKey más genérica para consistencia.
    const { data: attentionTypes, isLoading: isLoadingAttentionTypes } = useQuery<TipoAtencion[], Error>({
        queryKey: ['attentionTypes'],
        queryFn: attentionTypeService.getAll,
    });

    // Define el excludeCitaId para la llamada a getAvailableSlots
    const excludeCitaId = initialData?.cita_id;

    // Fetch de horas disponibles
    const {
        data: availableTimes,
        isLoading: isLoadingAvailableTimes,
        isError: isErrorSlots,
        error: slotsError,
    } = useQuery<TimeSlot[], Error>({
        queryKey: [
            'availableSlots',
            selectedDateStringForAPI,
            tipoAtencionIdValue,
            administradorIdValue,
            excludeCitaId,
        ],
        queryFn: () =>
            availabilityService.getAvailableSlots(
                administradorIdValue!,
                selectedDateStringForAPI!,
                tipoAtencionIdValue!,
                excludeCitaId
            ),
        enabled: !!selectedDateStringForAPI && !!administradorIdValue && !!tipoAtencionIdValue,
        staleTime: 0,
        gcTime: 0,
    });

    // Handlers
    const handleDateSelect = useCallback((date: Date | undefined) => {
        if (date) {
            const luxonDateInChile = DateTime.fromJSDate(date, { zone: CHILE_TIMEZONE });
            const startOfDayISO = luxonDateInChile.startOf('day').toUTC().toISO();
            form.setValue('fecha_hora_cita', startOfDayISO);
            // REMOVED: form.clearErrors('fecha_hora_cita'); // Let useEffect in AppointmentForm handle errors
        } else {
            form.setValue('fecha_hora_cita', '');
            // REMOVED: form.clearErrors('fecha_hora_cita'); // Let useEffect in AppointmentForm handle errors
        }
    }, [form]);

    const handleTimeSelect = useCallback((isoTimeString: string) => {
        form.setValue('fecha_hora_cita', isoTimeString);
        // REMOVED: form.clearErrors('fecha_hora_cita'); // Let useEffect in AppointmentForm handle errors
    }, [form]);

    const handleAttentionTypeSelectChange = useCallback((value: string) => {
        form.setValue('tipo_atencion_id', Number(value));
        if (selectedDate) {
            form.setValue('fecha_hora_cita', ''); // Clear time when attention type changes
        }
    }, [form, selectedDate]);

    const handleAdministratorSelectChange = useCallback((value: string) => {
        form.setValue('administrador_id', Number(value));
        if (selectedDate) {
            form.setValue('fecha_hora_cita', ''); // Clear time when administrator changes
        }
    }, [form, selectedDate]);

    const canShowSlots = !!administradorIdValue && !!selectedDate && !!tipoAtencionIdValue;

    return {
        selectedDate,
        selectedDateStringForAPI,
        tipoAtencionIdValue,
        administradorIdValue,
        administrators,
        isLoadingAdministrators,
        attentionTypes,
        isLoadingAttentionTypes,
        availableTimes,
        isLoadingAvailableTimes,
        isErrorSlots,
        slotsError,
        canShowSlots,
        handleDateSelect,
        handleTimeSelect,
        handleAttentionTypeSelectChange,
        handleAdministratorSelectChange,
    };
};