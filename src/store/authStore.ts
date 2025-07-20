import { create } from "zustand";
import api from "@/lib/api";

interface UserData {
  email: string;
  nombre?: string;
}

interface AuthState {
  isAuthenticated: boolean;
  accessToken: string | null;
  user: UserData | null;
  isLoading: boolean;

  login: (accessToken: string, userData: UserData) => void;
  logout: () => void;
  setAccessToken: (token: string | null) => void;
  initializeAuth: () => Promise<void>;
}

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
  logout: () => {
    localStorage.removeItem("accessToken");
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

  // Función para inicializar el estado de autenticación al cargar la aplicación
  initializeAuth: async () => {
    set({ isLoading: true });

    const storedAccessToken = localStorage.getItem("accessToken");
    if (storedAccessToken) {
      try {
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
          console.log("Other error during initialization. Logging out.");
        }
        localStorage.removeItem("accessToken");
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
