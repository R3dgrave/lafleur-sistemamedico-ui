// src/services/clinicalHistoryService.ts
import api from "../lib/api";
import type {
  HistoriaClinica,
  CreateHistoriaClinicaData,
  Anamnesis,
  CreateAnamnesisData,
  UpdateAnamnesisData,
  ExploracionFisica,
  CreateExploracionFisicaData,
  UpdateExploracionFisicaData,
  Diagnostico,
  CreateDiagnosticoData,
  UpdateDiagnosticoData,
  PlanTratamiento,
  UpdatePlanTratamientoData,
  CreatePlanTratamientoData,
  PruebasIniciales,
  CreatePruebasInicialesData,
  UpdatePruebasInicialesData,
} from "../types/index";

export const clinicalHistoryService = {
  /**
   * Crea una nueva historia clínica para un paciente.
   * @param {CreateHistoriaClinicaData} data - Datos para crear la historia clínica (paciente_id).
   * @returns {Promise<HistoriaClinica>} La historia clínica creada.
   */
  createHistoriaClinica: async (
    data: CreateHistoriaClinicaData
  ): Promise<HistoriaClinica> => {
    const response = await api.post("/historia-clinica", data);
    return response.data.historiaClinica;
  },

  /**
   * Obtiene la historia clínica de un paciente por su ID.
   * @param {number} pacienteId - ID del paciente.
   * @returns {Promise<HistoriaClinica>} La historia clínica del paciente.
   */
  getHistoriaClinicaByPacienteId: async (
    pacienteId: number
  ): Promise<HistoriaClinica> => {
    const response = await api.get(`/historia-clinica/paciente/${pacienteId}`);
    return response.data;
  },

  /**
   * Obtiene la historia clínica de un paciente por su RUT.
   * @param {string} rut - RUT del paciente.
   * @returns {Promise<HistoriaClinica>} La historia clínica del paciente.
   */
  getHistoriaClinicaByPacienteRut: async (
    rut: string
  ): Promise<HistoriaClinica> => {
    const response = await api.get(`/historia-clinica/rut/${rut}`);
    return response.data;
  },

  /**
   * Crea un nuevo registro de anamnesis para una historia clínica.
   * @param {number} historiaClinicaId - ID de la historia clínica a la que pertenece la anamnesis.
   * @param {CreateAnamnesisData} data - Datos para crear la anamnesis.
   * @returns {Promise<Anamnesis>} La anamnesis creada.
   */
  createAnamnesis: async (
    historiaClinicaId: number,
    data: CreateAnamnesisData
  ): Promise<Anamnesis> => {
    const response = await api.post(
      `/historia-clinica/${historiaClinicaId}/anamnesis`,
      data
    );
    return response.data.anamnesis;
  },

  /**
   * Obtiene todos los registros de anamnesis para una historia clínica específica.
   * @param {number} historiaClinicaId - ID de la historia clínica.
   * @returns {Promise<Anamnesis[]>} Un array de registros de anamnesis.
   */
  getAnamnesisByHistoriaClinicaId: async (
    historiaClinicaId: number
  ): Promise<Anamnesis[]> => {
    const response = await api.get(
      `/historia-clinica/${historiaClinicaId}/anamnesis`
    );
    return response.data;
  },

  /**
   * Actualiza un registro de anamnesis existente.
   * @param {number} anamnesisId - ID de la anamnesis a actualizar.
   * @param {UpdateAnamnesisData} data - Datos para actualizar la anamnesis.
   * @returns {Promise<Anamnesis>} La anamnesis actualizada.
   */
  updateAnamnesis: async (
    anamnesisId: number,
    data: UpdateAnamnesisData
  ): Promise<Anamnesis> => {
    const response = await api.put(
      `/historia-clinica/anamnesis/${anamnesisId}`,
      data
    );
    return response.data.anamnesis;
  },

  /**
   * Elimina un registro de anamnesis por su ID.
   * @param {number} anamnesisId - ID de la anamnesis a eliminar.
   * @returns {Promise<void>}
   */
  deleteAnamnesis: async (anamnesisId: number): Promise<void> => {
    await api.delete(`/historia-clinica/anamnesis/${anamnesisId}`);
  },

  // --- FUNCIONES EXPLORACION_FISICA ---

  /**
   * Crea un nuevo registro de exploración física para una historia clínica.
   * @param {number} historiaClinicaId - ID de la historia clínica a la que pertenece la exploración física.
   * @param {CreateExploracionFisicaData} data - Datos para crear la exploración física.
   * @returns {Promise<ExploracionFisica>} La exploración física creada.
   */
  createExploracionFisica: async (
    historiaClinicaId: number,
    data: CreateExploracionFisicaData
  ): Promise<ExploracionFisica> => {
    const response = await api.post(
      `/historia-clinica/${historiaClinicaId}/exploracion-fisica`,
      data
    );
    return response.data.exploracionFisica;
  },

  /**
   * Obtiene todos los registros de exploración física para una historia clínica específica.
   * @param {number} historiaClinicaId - ID de la historia clínica.
   * @returns {Promise<ExploracionFisica[]>} Un array de registros de exploración física.
   */
  getExploracionFisicaByHistoriaClinicaId: async (
    historiaClinicaId: number
  ): Promise<ExploracionFisica[]> => {
    const response = await api.get(
      `/historia-clinica/${historiaClinicaId}/exploracion-fisica`
    );
    return response.data;
  },

  /**
   * Actualiza un registro de exploración física existente.
   * @param {number} exploracionId - ID de la exploración física a actualizar.
   * @param {UpdateExploracionFisicaData} data - Datos para actualizar la exploración física.
   * @returns {Promise<ExploracionFisica>} La exploración física actualizada.
   */
  updateExploracionFisica: async (
    exploracionId: number,
    data: UpdateExploracionFisicaData
  ): Promise<ExploracionFisica> => {
    const response = await api.put(
      `/historia-clinica/exploracion-fisica/${exploracionId}`,
      data
    );
    return response.data.exploracionFisica;
  },

  /**
   * Elimina un registro de exploración física por su ID.
   * @param {number} exploracionId - ID de la exploración física a eliminar.
   * @returns {Promise<void>}
   */
  deleteExploracionFisica: async (exploracionId: number): Promise<void> => {
    await api.delete(`/historia-clinica/exploracion-fisica/${exploracionId}`);
  },

  /**
   * Crea un nuevo registro de diagnóstico para una historia clínica.
   * @param {number} historiaClinicaId - ID de la historia clínica a la que pertenece el diagnóstico.
   * @param {CreateDiagnosticoData} data - Datos para crear el diagnóstico.
   * @returns {Promise<Diagnostico>} El diagnóstico creado.
   */
  createDiagnostico: async (
    historiaClinicaId: number,
    data: CreateDiagnosticoData
  ): Promise<Diagnostico> => {
    const response = await api.post(
      `/historia-clinica/${historiaClinicaId}/diagnosticos`,
      data
    );
    return response.data.diagnostico;
  },

  /**
   * Obtiene todos los registros de diagnóstico para una historia clínica específica.
   * @param {number} historiaClinicaId - ID de la historia clínica.
   * @returns {Promise<Diagnostico[]>} Un array de registros de diagnóstico.
   */
  getDiagnosticosByHistoriaClinicaId: async (
    historiaClinicaId: number
  ): Promise<Diagnostico[]> => {
    const response = await api.get(
      `/historia-clinica/${historiaClinicaId}/diagnosticos`
    );
    return response.data;
  },

  /**
   * Actualiza un registro de diagnóstico existente.
   * @param {number} diagnosticoId - ID del diagnóstico a actualizar.
   * @param {UpdateDiagnosticoData} data - Datos para actualizar el diagnóstico.
   * @returns {Promise<Diagnostico>} El diagnóstico actualizado.
   */
  updateDiagnostico: async (
    diagnosticoId: number,
    data: UpdateDiagnosticoData
  ): Promise<Diagnostico> => {
    const response = await api.put(
      `/historia-clinica/diagnosticos/${diagnosticoId}`,
      data
    );
    return response.data.diagnostico;
  },

  /**
   * Elimina un registro de diagnóstico por su ID.
   * @param {number} diagnosticoId - ID del diagnóstico a eliminar.
   * @returns {Promise<void>}
   */
  deleteDiagnostico: async (diagnosticoId: number): Promise<void> => {
    await api.delete(`/historia-clinica/diagnosticos/${diagnosticoId}`);
  },

  /**
   * Crea un nuevo registro de plan de tratamiento para una historia clínica.
   * @param {number} historiaClinicaId - ID de la historia clínica a la que pertenece el plan de tratamiento.
   * @param {CreatePlanTratamientoData} data - Datos para crear el plan de tratamiento.
   * @returns {Promise<PlanTratamiento>} El plan de tratamiento creado.
   */
  createPlanTratamiento: async (
    historiaClinicaId: number,
    data: CreatePlanTratamientoData
  ): Promise<PlanTratamiento> => {
    const response = await api.post(
      `/historia-clinica/${historiaClinicaId}/plan-tratamiento`,
      data
    );
    return response.data.planTratamiento;
  },

  /**
   * Obtiene todos los registros de plan de tratamiento para una historia clínica específica.
   * @param {number} historiaClinicaId - ID de la historia clínica.
   * @returns {Promise<PlanTratamiento[]>} Un array de registros de plan de tratamiento.
   */
  getPlanesTratamientoByHistoriaClinicaId: async (
    historiaClinicaId: number
  ): Promise<PlanTratamiento[]> => {
    const response = await api.get(
      `/historia-clinica/${historiaClinicaId}/plan-tratamiento`
    );
    return response.data;
  },

  /**
   * Actualiza un registro de plan de tratamiento existente.
   * @param {number} planId - ID del plan de tratamiento a actualizar.
   * @param {UpdatePlanTratamientoData} data - Datos para actualizar el plan de tratamiento.
   * @returns {Promise<PlanTratamiento>} El plan de tratamiento actualizado.
   */
  updatePlanTratamiento: async (
    planId: number,
    data: UpdatePlanTratamientoData
  ): Promise<PlanTratamiento> => {
    const response = await api.put(
      `/historia-clinica/plan-tratamiento/${planId}`,
      data
    );
    return response.data.planTratamiento;
  },

  /**
   * Elimina un registro de plan de tratamiento por su ID.
   * @param {number} planId - ID del plan de tratamiento a eliminar.
   * @returns {Promise<void>}
   */
  deletePlanTratamiento: async (planId: number): Promise<void> => {
    await api.delete(`/historia-clinica/plan-tratamiento/${planId}`);
  },

  /**
   * Crea un nuevo registro de prueba inicial.
   * @param {CreatePruebasInicialesData} data - Datos para crear la prueba inicial, incluyendo paciente_id.
   * @returns {Promise<PruebasIniciales>} La prueba inicial creada.
   */
  createPruebasIniciales: async (
    historiaClinicaId: number,
    data: CreatePruebasInicialesData
  ): Promise<PruebasIniciales> => {
    const response = await api.post(
      `/historia-clinica/${historiaClinicaId}/pruebas-iniciales`,
      data
    );
    return response.data.nuevaPrueba;
  },

  /**
   * Obtiene todos los registros de pruebas iniciales para un paciente específico.
   * @param {number} pacienteId - ID del paciente.
   * @returns {Promise<PruebasIniciales[]>} Un array de registros de pruebas iniciales.
   */
  getPruebasInicialesByPacienteId: async (
    pacienteId: number
  ): Promise<PruebasIniciales[]> => {
    const response = await api.get(
      `/historia-clinica/pruebas-iniciales/paciente/${pacienteId}`
    );
    return response.data;
  },

  /**
   * Actualiza un registro de prueba inicial existente.
   * @param {number} pruebaId - ID de la prueba inicial a actualizar.
   * @param {UpdatePruebasInicialesData} data - Datos para actualizar la prueba inicial.
   * @returns {Promise<PruebasIniciales>} La prueba inicial actualizada.
   */
  updatePruebasIniciales: async (
    pruebaId: number,
    data: UpdatePruebasInicialesData
  ): Promise<PruebasIniciales> => {
    const response = await api.put(
      `/historia-clinica/pruebas-iniciales/${pruebaId}`,
      data
    );
    return response.data;
  },

  /**
   * Elimina un registro de prueba inicial por su ID.
   * @param {number} pruebaId - ID de la prueba inicial a eliminar.
   * @returns {Promise<void>}
   */
  deletePruebasIniciales: async (pruebaId: number): Promise<void> => {
    await api.delete(`/historia-clinica/pruebas-iniciales/${pruebaId}`);
  },
};
