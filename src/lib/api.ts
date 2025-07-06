import axios from "axios";
import useAuthStore from "@/store/authStore"; // Importa tu store de Zustand
import { toast } from "react-toastify"; // Para mostrar mensajes

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
const processQueue = (error: any, token: string | null = null) => {
  failedRequestsQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedRequestsQueue = [];
};

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

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const accessToken = useAuthStore.getState().accessToken;
    const logout = useAuthStore.getState().logout;
    const setAccessToken = useAuthStore.getState().setAccessToken;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedRequestsQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      isRefreshing = true;

      try {
        const response = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/autenticacion/refrescar`,
          {},
          { withCredentials: true }
        );

        const { accessToken: newAccessToken } = response.data;

        setAccessToken(newAccessToken);
        toast.success("Sesión actualizada. Reintentando tu acción.");

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        processQueue(null, newAccessToken);
        return api(originalRequest);
      } catch (refreshError: any) {
        console.error("Error al refrescar el token:", refreshError);
        toast.error(
          "Tu sesión ha expirado. Por favor, inicia sesión de nuevo."
        );
        logout();
        processQueue(refreshError);
        //window.location.href = "/";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
