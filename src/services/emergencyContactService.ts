// src/services/emergencyContactService.ts
import api from "@/lib/api";
import type {
  ContactoEmergencia,
  CreateContactoEmergenciaFormValues,
  UpdateContactoEmergenciaFormValues,
} from "../types/index";

export const emergencyContactService = {
  getAll: async (paciente_id?: number): Promise<ContactoEmergencia[]> => {
    const response = await api.get("/contactos-emergencia", {
      params: paciente_id ? { paciente_id } : {},
    });
    return response.data;
  },

  getByPacienteRut: async (rut: string): Promise<ContactoEmergencia[]> => {
    const response = await api.get(`/contactos-emergencia/por-paciente/${rut}`);
    return response.data;
  },

  getById: async (id: number): Promise<ContactoEmergencia> => {
    const response = await api.get(`/contactos-emergencia/${id}`);
    return response.data;
  },

  create: async (
    data: CreateContactoEmergenciaFormValues
  ): Promise<ContactoEmergencia> => {
    const response = await api.post("/contactos-emergencia", data);
    return response.data.contacto;
  },

  update: async (
    id: number,
    data: UpdateContactoEmergenciaFormValues
  ): Promise<ContactoEmergencia> => {
    const response = await api.put(`/contactos-emergencia/${id}`, data);
    return response.data.contacto;
  },

  delete: async (id: number): Promise<{ message: string }> => {
    const response = await api.delete(`/contactos-emergencia/${id}`);
    return response.data;
  },
};
