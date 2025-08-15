// src/services/appointmentService.ts
import api from "@/lib/api";
import type {
  Cita,
  CreateCitaFormValues,
  TimeSlot,
  UpdateCitaFormValues,
} from "@/types";
import { DateTime } from "luxon";
const STANDARD_APPOINTMENT_DURATION = 60;

export const appointmentService = {
  getAll: async (filters?: {
    paciente_id?: number;
    tipo_atencion_id?: number;
    estado_cita?: string;
    fecha_inicio?: string; // YYYY-MM-DD
    fecha_fin?: string; // YYYY-MM-DD
  }): Promise<Cita[]> => {
    const response = await api.get("/citas", { params: filters });
    return response.data;
  },

  getAvailableTimes: async (
    date: string,
    adminId: number,
    tipoAtencionId: number
  ): Promise<TimeSlot[]> => {
    // Definimos el tipo de dato que esperamos del backend
    type TimeResponse = { start: string; end: string /* otras propiedades */ };
    const response = await api.get<TimeResponse[]>( // <- Esperamos un array de objetos TimeResponse
      `/disponibilidad/franjas-disponibles?administradorId=${adminId}&fecha=${date}&tipoAtencionId=${tipoAtencionId}`
    );

    // Ahora, mapeamos sobre el array de objetos y accedemos a la propiedad `start`
    return response.data
      .map((item) => {
        if (!item || typeof item.start !== "string") {
          console.error(`Invalid start time received:`, item);
          return null;
        }

        const startDateTime = DateTime.fromISO(item.start, { zone: "utc" });

        if (!startDateTime.isValid) {
          console.error(`Invalid ISO string from backend: ${item.start}`);
          return null;
        }

        const endDateTime = startDateTime.plus({
          minutes: STANDARD_APPOINTMENT_DURATION,
        });

        return {
          start: startDateTime.toISO(),
          end: endDateTime.toISO(),
        };
      })
      .filter((slot): slot is TimeSlot => slot !== null);
  },

  getById: async (id: number): Promise<Cita> => {
    const response = await api.get(`/citas/${id}`);
    return response.data;
  },

  getByPacienteRut: async (rut: string): Promise<Cita[]> => {
    const response = await api.get(`/citas/por-paciente/${rut}`);
    return response.data;
  },

  create: async (data: CreateCitaFormValues): Promise<Cita> => {
    const response = await api.post("/citas", data);
    return response.data.cita;
  },

  update: async (id: number, data: UpdateCitaFormValues): Promise<Cita> => {
    const response = await api.put(`/citas/${id}`, data);
    return response.data.cita;
  },

  delete: async (id: number): Promise<{ message: string }> => {
    const response = await api.delete(`/citas/${id}`);
    return response.data;
  },
};
