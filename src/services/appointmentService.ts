// src/services/appointmentService.ts
import api from "@/lib/api";
import type { Cita, CreateCitaFormValues, UpdateCitaFormValues } from "@/types";

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
    attentionTypeId: number
  ): Promise<string[]> => {
    const response = await api.get(`/disponibilidad/franjas-disponibles?administradorId=${adminId}&fecha=${date}&tipoAtencionId=${attentionTypeId}`);
    return response.data;
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
