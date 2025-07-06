export interface Administrador {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  password_hash: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  accessToken: string | null;
  user: { email: string } | null;
  login: (accessToken: string, userEmail: string) => void;
  logout: () => void;
}

export type AdminastradorFormValues = Omit<Administrador, "id">;
