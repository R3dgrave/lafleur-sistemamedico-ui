// src/lib/api.ts
import axios, { AxiosError } from "axios";
import type { InternalAxiosRequestConfig } from "axios";
import useAuthStore from "@/store/authStore";
import { toast } from "react-toastify";

interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

let isRefreshing = false;
let failedRequestsQueue: Array<{
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
}> = [];

// Función para procesar la cola de peticiones fallidas
const processQueue = (
  error: AxiosError | null,
  token: string | null = null
) => {
  failedRequestsQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedRequestsQueue = [];
};

// Interceptor de Respuestas: Maneja la renovación de tokens y errores globales
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as CustomAxiosRequestConfig;
    const accessToken = useAuthStore.getState().accessToken;
    const logout = useAuthStore.getState().logout;
    const setAccessToken = useAuthStore.getState().setAccessToken;

    // Caso 1: Error 401 (No autorizado) - Lógica de renovación de token
    if (error.response?.status === 401 && !originalRequest?._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedRequestsQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest?.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return api(originalRequest!);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest!._retry = true;
      isRefreshing = true;

      try {
        const response = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/autenticacion/refrescar`,
          { accessToken },
          { withCredentials: true }
        );

        const { accessToken: newAccessToken } = response.data;
        setAccessToken(newAccessToken);
        toast.success("Sesión actualizada. Reintentando tu acción.");

        if (originalRequest?.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }
        processQueue(null, newAccessToken);
        return api(originalRequest!);
      } catch (refreshError: any) {
        console.error("Error al refrescar el token:", refreshError);
        toast.error(
          "Tu sesión ha expirado. Por favor, inicia sesión de nuevo."
        );
        logout();
        processQueue(refreshError);
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Caso 2: Manejo de otros errores comunes (fuera del 401)
    if (error.response) {
      const { status, data } = error.response;
      const errorMessage = (data as any)?.message || "Ocurrió un error inesperado.";

      switch (status) {
        case 400:
          toast.error(errorMessage);
          break;
        case 404: // Not Found
          toast.error(errorMessage);
          break;
        case 409: // Conflict
          toast.error(errorMessage);
          break;
        case 500: // Server Error
          toast.error(
            "Error interno del servidor. Por favor, inténtalo más tarde."
          );
          break;
        default:
          toast.error(`Error del servidor: ${status}.`);
          break;
      }
    } else if (error.request) {
      toast.error(
        "No se pudo conectar con el servidor. Revisa tu conexión a internet."
      );
    } else {
      toast.error("Ocurrió un error al procesar tu solicitud.");
    }
    return Promise.reject(error);
  }
);

// Interceptor de Peticiones: Añade el accessToken a cada petición
api.interceptors.request.use(
  (config) => {
    const accessToken = useAuthStore.getState().accessToken;
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
