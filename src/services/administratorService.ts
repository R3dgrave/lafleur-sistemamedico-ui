// src/services/administratorService.ts
import api from "@/lib/api";
import type {
  Administrador,
  UpdateProfileData,
  UpdatePasswordData,
  UpdateNotificationPreferencesData,
  HorarioDisponible,
  CreateHorarioDisponibleData,
  UpdateHorarioDisponibleData,
  ExcepcionDisponibilidad,
  CreateExcepcionDisponibilidadData,
  UpdateExcepcionDisponibilidadData,
} from "@/types";

export const administratorService = {
  /**
   * Obtiene todos los administradores registrados en el sistema.
   * @returns {Promise<Administrador[]>} Una promesa que resuelve con un array de administradores.
   */
  getAll: async (): Promise<Administrador[]> => {
    const response = await api.get("autenticacion/administradores");
    return response.data;
  },
  /**
   * Obtiene la información del usuario autenticado desde el backend.
   * Requiere que el token de acceso esté en los headers de la solicitud
   * @returns {Promise<Administrador>} Los datos del usuario autenticado.
   */
  getAuthenticatedUser: async (): Promise<Administrador> => {
    const response = await api.get(`/autenticacion/perfil`);
    return response.data;
  },

  /**
   * Cierra la sesión del usuario autenticado.
   * @returns {Promise<void>}
   */
  logout: async (): Promise<void> => {
    const response = await api.post("/autenticacion/cerrar-sesion");
    return response.data;
  },

  /**
   * Actualiza la información del perfil del administrador autenticado.
   * @param {UpdateProfileData} data - Los datos a actualizar (nombre, apellido, email, profilePictureUrl).
   * @param {File | null} [profilePictureFile=null] - Archivo de imagen de perfil opcional.
   * @returns {Promise<Administrador>} El administrador actualizado.
   */
  updateAdminProfile: async (
    data: UpdateProfileData,
    profilePictureFile: File | null = null
  ): Promise<Administrador> => {
    const formData = new FormData();

    // Añade los campos de texto al FormData
    if (data.nombre !== undefined) formData.append("nombre", data.nombre);
    if (data.apellido !== undefined) formData.append("apellido", data.apellido);
    if (data.email !== undefined) formData.append("email", data.email);

    // Si se pasa un archivo, añádelo
    if (profilePictureFile) {
      formData.append("profile_picture", profilePictureFile); // 'profile_picture' es el nombre del campo que el backend esperará
    } else if (data.profilePictureUrl === null) {
      // Si profilePictureUrl es explícitamente null, significa que se quiere borrar la imagen
      formData.append("profile_picture_url", "null"); // Envía una cadena "null" para indicar que se debe borrar
    }

    // Envía la solicitud con FormData y el tipo de contenido adecuado
    const response = await api.put("/autenticacion/editar-perfil", formData, {
      headers: {
        "Content-Type": "multipart/form-data", // Importante para enviar archivos
      },
    });
    return response.data.user; // El backend devuelve { message, user }
  },

  /**
   * Permite a un administrador autenticado cambiar su contraseña.
   * @param {UpdatePasswordData} data - La contraseña actual, nueva y confirmación.
   * @returns {Promise<void>}
   */
  updateAdminPassword: async (data: UpdatePasswordData): Promise<void> => {
    await api.put("/autenticacion/actualizar-contrasena", data);
  },

  /**
   * Actualiza las preferencias de notificación de un administrador autenticado.
   * @param {UpdateNotificationPreferencesData} data - Las preferencias de notificación a actualizar.
   * @returns {Promise<UpdateNotificationPreferencesData>}
   */
  updateAdminNotificationPreferences: async (
    data: UpdateNotificationPreferencesData
  ): Promise<UpdateNotificationPreferencesData> => {
    const response = await api.put(
      "/autenticacion/actualizar-preferencias-notificacion",
      data
    );
    return response.data;
  },

  /**
   * Obtiene todos los horarios disponibles para el administrador autenticado.
   * @returns {Promise<HorarioDisponible[]>}
   */
  getAllHorariosDisponibles: async (): Promise<HorarioDisponible[]> => {
    const response = await api.get("/disponibilidad/horarios");
    return response.data;
  },

  /**
   * Crea un nuevo horario disponible para el administrador autenticado.
   * @param {CreateHorarioDisponibleData} data - Datos del horario a crear.
   * @returns {Promise<HorarioDisponible>}
   */
  createHorarioDisponible: async (
    data: CreateHorarioDisponibleData
  ): Promise<HorarioDisponible> => {
    const response = await api.post("/disponibilidad/horarios", data);
    return response.data.horario; // Asumiendo que el backend devuelve { message, horario }
  },

  /**
   * Actualiza un horario disponible existente.
   * @param {number} horarioId - ID del horario a actualizar.
   * @param {UpdateHorarioDisponibleData} data - Datos del horario a actualizar.
   * @returns {Promise<HorarioDisponible>} El horario actualizado.
   */
  updateHorarioDisponible: async (
    horarioId: number,
    data: UpdateHorarioDisponibleData
  ): Promise<HorarioDisponible> => {
    const response = await api.put(
      `/disponibilidad/horarios/${horarioId}`,
      data
    );
    return response.data.horario; // Asumiendo que el backend devuelve { message, horario }
  },

  /**
   * Elimina un horario disponible por su ID.
   * @param {number} horarioId - ID del horario a eliminar.
   * @returns {Promise<void>}
   */
  deleteHorarioDisponible: async (horarioId: number): Promise<void> => {
    await api.delete(`/disponibilidad/horarios/${horarioId}`);
  },

  /**
   * Obtiene todas las excepciones de disponibilidad para el administrador autenticado.
   * @returns {Promise<ExcepcionDisponibilidad[]>}
   */
  getAllExcepcionesDisponibilidad: async (): Promise<
    ExcepcionDisponibilidad[]
  > => {
    const response = await api.get("/disponibilidad/excepciones");
    return response.data;
  },

  /**
   * Crea una nueva excepción de disponibilidad para el administrador autenticado.
   * @param {CreateExcepcionDisponibilidadData} data - Datos de la excepción a crear.
   * @returns {Promise<ExcepcionDisponibilidad>}
   */
  createExcepcionDisponibilidad: async (
    data: CreateExcepcionDisponibilidadData
  ): Promise<ExcepcionDisponibilidad> => {
    const response = await api.post("/disponibilidad/excepciones", data);
    return response.data.excepcion; // Asumiendo que el backend devuelve { message, excepcion }
  },

  /**
   * Actualiza una excepción de disponibilidad existente.
   * @param {number} excepcionId - ID de la excepción a actualizar.
   * @param {UpdateExcepcionDisponibilidadData} data - Datos de la excepción a actualizar.
   * @returns {Promise<ExcepcionDisponibilidad>} La excepción actualizada.
   */
  updateExcepcionDisponibilidad: async (
    excepcionId: number,
    data: UpdateExcepcionDisponibilidadData
  ): Promise<ExcepcionDisponibilidad> => {
    const response = await api.put(
      `/disponibilidad/excepciones/${excepcionId}`,
      data
    );
    return response.data.excepcion; // Asumiendo que el backend devuelve { message, excepcion }
  },

  /**
   * Elimina una excepción de disponibilidad por su ID.
   * @param {number} excepcionId - ID de la excepción a eliminar.
   * @returns {Promise<void>}
   */
  deleteExcepcionDisponibilidad: async (excepcionId: number): Promise<void> => {
    await api.delete(`/disponibilidad/excepciones/${excepcionId}`);
  },
};
