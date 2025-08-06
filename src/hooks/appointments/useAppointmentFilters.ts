import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { patientService } from '@/services/patientService';
import { attentionTypeService } from '@/services/attentionTypeService';
import { appointmentService } from '@/services/appointmentService';
import type { Paciente, TipoAtencion, Cita } from '@/types';

interface UseAppointmentFiltersResult {
    filterPacienteId: number | undefined;
    setFilterPacienteId: (id: number | undefined) => void;
    filterTipoAtencionId: number | undefined;
    setFilterTipoAtencionId: (id: number | undefined) => void;
    filterEstadoCita: string;
    setFilterEstadoCita: (estado: string) => void;
    filterFechaInicio: Date | undefined;
    setFilterFechaInicio: (date: Date | undefined) => void;
    filterFechaFin: Date | undefined;
    setFilterFechaFin: (date: Date | undefined) => void;
    handleClearFilters: () => void;
    allPatients: Paciente[] | undefined;
    isLoadingAllPatients: boolean;
    allAttentionTypes: TipoAtencion[] | undefined;
    isLoadingAllAttentionTypes: boolean;
    citas: Cita[] | undefined;
    isLoadingCitas: boolean;
    isErrorCitas: boolean;
    citasError: Error | null;
}

export const useAppointmentFilters = (): UseAppointmentFiltersResult => {
    const [filterPacienteId, setFilterPacienteId] = useState<number | undefined>(undefined);
    const [filterTipoAtencionId, setFilterTipoAtencionId] = useState<number | undefined>(undefined);
    const [filterEstadoCita, setFilterEstadoCita] = useState<string>("");
    const [filterFechaInicio, setFilterFechaInicio] = useState<Date | undefined>(undefined);
    const [filterFechaFin, setFilterFechaFin] = useState<Date | undefined>(undefined);

    // Fetch de todos los pacientes para el filtro: queryKey más genérica
    const { data: allPatients, isLoading: isLoadingAllPatients } = useQuery<Paciente[], Error>({
        queryKey: ["patients"], // Cambiado de 'allPatientsForFilter' a 'patients'
        queryFn: patientService.getAll,
    });

    // Fetch de todos los tipos de atención para el filtro: queryKey más genérica
    const { data: allAttentionTypes, isLoading: isLoadingAllAttentionTypes } = useQuery<TipoAtencion[], Error>({
        queryKey: ["attentionTypes"], // Cambiado de 'allAttentionTypesForFilter' a 'attentionTypes'
        queryFn: attentionTypeService.getAll,
    });

    // Parámetros de la query para las citas, memorizados para evitar re-renders innecesarios
    const queryParams = useMemo(() => ({
        paciente_id: filterPacienteId,
        tipo_atencion_id: filterTipoAtencionId,
        estado_cita: filterEstadoCita || undefined,
        fecha_inicio: filterFechaInicio ? format(filterFechaInicio, "yyyy-MM-dd") : undefined,
        fecha_fin: filterFechaFin ? format(filterFechaFin, "yyyy-MM-dd") : undefined,
    }), [filterPacienteId, filterTipoAtencionId, filterEstadoCita, filterFechaInicio, filterFechaFin]);

    // Fetch de citas con filtros
    const {
        data: citas,
        isLoading: isLoadingCitas,
        isError: isErrorCitas,
        error: citasError,
    } = useQuery<Cita[], Error>({
        queryKey: ["citas", queryParams], // La queryKey ahora incluye los parámetros para refetch automático
        queryFn: () => appointmentService.getAll(queryParams),
    });

    const handleClearFilters = () => {
        setFilterPacienteId(undefined);
        setFilterTipoAtencionId(undefined);
        setFilterEstadoCita("");
        setFilterFechaInicio(undefined);
        setFilterFechaFin(undefined);
        // No es necesario invalidar 'citas' explícitamente aquí,
        // ya que el cambio en los estados de filtro (queryParams)
        // automáticamente invalidará y refetcheará la query 'citas'.
    };

    return {
        filterPacienteId,
        setFilterPacienteId,
        filterTipoAtencionId,
        setFilterTipoAtencionId,
        filterEstadoCita,
        setFilterEstadoCita,
        filterFechaInicio,
        setFilterFechaInicio,
        filterFechaFin,
        setFilterFechaFin,
        handleClearFilters,
        allPatients,
        isLoadingAllPatients,
        allAttentionTypes,
        isLoadingAllAttentionTypes,
        citas,
        isLoadingCitas,
        isErrorCitas,
        citasError,
    };
};
