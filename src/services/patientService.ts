// src/services/patientService.ts
import api from "@/lib/api";
import type {
  Paciente,
  CreatePacienteFormValues,
  UpdatePacienteFormValues,
} from "../types/index";

export const patientService = {
  getAll: async (): Promise<Paciente[]> => {
    const response = await api.get("/pacientes");
    return response.data;
  },

  getById: async (id: number): Promise<Paciente> => {
    const response = await api.get(`/pacientes/${id}`);
    return response.data;
  },

  getPatientByRut: async (rut: string): Promise<Paciente> => {
    const response = await api.get(`/pacientes/rut/${rut}`);
    return response.data;
  },

  create: async (data: CreatePacienteFormValues): Promise<Paciente> => {
    const response = await api.post("/pacientes", data);
    return response.data.paciente;
  },

  update: async (
    id: number,
    data: UpdatePacienteFormValues
  ): Promise<Paciente> => {
    const response = await api.put(`/pacientes/${id}`, data);
    return response.data.paciente;
  },

  delete: async (id: number): Promise<{ message: string }> => {
    const response = await api.delete(`/pacientes/${id}`);
    return response.data;
  },
};
