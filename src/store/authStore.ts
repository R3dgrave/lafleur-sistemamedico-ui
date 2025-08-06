// src/store/authStore.ts
import { create } from "zustand";
import api from "@/lib/api";
import type { AuthState } from "@/types";

const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  accessToken: null,
  user: null,
  isLoading: true,

  // Función para iniciar sesión
  login: (accessToken, userData) => {
    localStorage.setItem("accessToken", accessToken);
    set({
      isAuthenticated: true,
      accessToken,
      user: userData,
      isLoading: false,
    });
  },

  // Función para cerrar sesión
  logout: async () => {
    localStorage.removeItem("accessToken");
    // También elimina el refresh token si lo manejas en el cliente (ej. cookies)
    // Aunque el backend ya limpia la cookie, es buena práctica aquí también.
    await api.post("/autenticacion/cerrar-sesion");
    set({
      isAuthenticated: false,
      accessToken: null,
      user: null,
      isLoading: false,
    });
  },

  // Función para actualizar solo el accessToken (útil después de un refresh)
  setAccessToken: (token) => {
    if (token) {
      localStorage.setItem("accessToken", token);
      set({ accessToken: token, isAuthenticated: true });
    } else {
      localStorage.removeItem("accessToken");
      set({ accessToken: null, isAuthenticated: false });
    }
  },

  // Función para actualizar el objeto de usuario en el store
  updateUserInStore: (userData) => {
    set({ user: userData });
  },

  // Función para inicializar el estado de autenticación al cargar la aplicación
  initializeAuth: async () => {
    set({ isLoading: true });

    const storedAccessToken = localStorage.getItem("accessToken");
    if (storedAccessToken) {
      // Configura el token en el interceptor de Axios si aún no está configurado
      // Esto es crucial para que las llamadas subsiguientes usen el token
      api.defaults.headers.common['Authorization'] = `Bearer ${storedAccessToken}`;

      try {
        // Esta es la ÚNICA llamada a /autenticacion/perfil al inicio
        const response = await api.get("/autenticacion/perfil");
        const userData = response.data;
        set({
          isAuthenticated: true,
          accessToken: storedAccessToken,
          user: userData,
          isLoading: false,
        });
      } catch (e: any) {
        if (e.response?.status === 401) {
          console.log(
            "Access token invalid or expired during initialization. Logging out."
          );
        } else {
          console.error("Error during authentication initialization:", e);
        }
        localStorage.removeItem("accessToken");
        delete api.defaults.headers.common['Authorization']; // Limpia el header
        set({
          isAuthenticated: false,
          accessToken: null,
          user: null,
          isLoading: false,
        });
      }
    } else {
      set({
        isAuthenticated: false,
        accessToken: null,
        user: null,
        isLoading: false,
      });
    }
  },
}));

export default useAuthStore;
