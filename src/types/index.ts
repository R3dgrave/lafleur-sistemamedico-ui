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

// --- Tipos para Paciente ---
export interface Paciente {
  paciente_id: number;
  nombre: string;
  apellido: string;
  fecha_nacimiento: string; // Formato 'YYYY-MM-DD'
  genero: string;
  identidad_genero?: string;
  sexo_registral?: string;
  telefono?: string;
  email: string;
  direccion?: string;
  rut?: string;
  fecha_registro: string; // Formato de fecha y hora
}

// Tipos para formularios de Paciente
export type CreatePacienteFormValues = Omit<
  Paciente,
  "paciente_id" | "fecha_registro"
>;
export type UpdatePacienteFormValues = Partial<
  Omit<Paciente, "paciente_id" | "fecha_registro">
>;

// --- Tipos para Contacto de Emergencia ---
export interface ContactoEmergencia {
  contacto_emergencia_id: number;
  paciente_id: number; // FK
  nombre_contacto: string;
  telefono_contacto: string;
  relacion_paciente?: string;
  fecha_registro: string;
  // Opcional: para incluir datos del paciente cuando se hace un include en el backend
  Paciente?: {
    nombre: string;
    apellido: string;
    rut?: string;
  };
}

// Tipos para formularios de Contacto de Emergencia
export type CreateContactoEmergenciaFormValues = Omit<
  ContactoEmergencia,
  "contacto_emergencia_id" | "fecha_registro" | "Paciente"
> & {
  rut_paciente: string; // Para crear un contacto asociado a un RUT
};
export type UpdateContactoEmergenciaFormValues = Partial<
  Omit<
    ContactoEmergencia,
    "contacto_emergencia_id" | "fecha_registro" | "Paciente"
  >
> & {
  rut_paciente?: string; // Opcional para actualizar
};
