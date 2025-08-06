// src/services/attentionTypeService.ts
import api from '@/lib/api';
import type { TipoAtencion, CreateTipoAtencionFormValues } from '@/types';

export const attentionTypeService = {
  getAll: async (): Promise<TipoAtencion[]> => {
    const response = await api.get('/tipos-atencion');
    return response.data;
  },

  create: async (data: CreateTipoAtencionFormValues): Promise<TipoAtencion> => {
    const response = await api.post('/tipos-atencion', data);
    return response.data.tipo;
  },
};