import api from "@/lib/api";
import type { TimeSlot } from "@/types";

export const availabilityService = {
  getAvailableSlots: async (
    adminId: number,
    date: string,
    attentionTypeId: number,
    excludeCitaId?: number
  ): Promise<TimeSlot[]> => {
    let url = `/disponibilidad/franjas-disponibles?administradorId=${adminId}&fecha=${date}&tipoAtencionId=${attentionTypeId}`;

    if (excludeCitaId) {
      url += `&excludeCitaId=${excludeCitaId}`;
    }

    const response = await api.get<TimeSlot[]>(url);
    return response.data;
  },
};
