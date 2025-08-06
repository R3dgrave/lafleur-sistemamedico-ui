export interface Administrador {
    administrador_id: number;
    nombre: string;
    apellido: string;
    email: string;
    password_hash: string;
    role: string;
    profilePictureUrl?: string;
    receive_email_notifications?: boolean;
    receive_sms_notifications?: boolean;
}

export type UpdateProfileData = {
    nombre?: string;
    apellido?: string;
    email?: string;
    profilePictureUrl?: string | null;
    receive_email_notifications?: boolean;
    receive_sms_notifications?: boolean;
};

export type UpdatePasswordData = {
    current_password: string;
    new_password: string;
    confirm_new_password: string;
};

export type UpdateNotificationPreferencesData = {
    receive_email_notifications?: boolean;
    receive_sms_notifications?: boolean;
};

export interface AuthState {
    isAuthenticated: boolean;
    accessToken: string | null;
    user: Administrador | null;
    isLoading: boolean;
    login: (accessToken: string, userData: Administrador) => void;
    logout: () => void;
    setAccessToken: (token: string | null) => void;
    initializeAuth: () => Promise<void>;
    updateUserInStore: (userData: Administrador) => void;
}

export type AdminastradorFormValues = Omit<Administrador, "id">;

export interface Paciente {
    paciente_id: number;
    nombre: string;
    apellido: string;
    fecha_nacimiento: string; // Formato 'YYYY-MM-DD'
    genero:
        | "Masculino"
        | "Femenino"
        | "No Binario"
        | "Otro"
        | "Prefiero no decir";
    identidad_genero?: string;
    sexo_registral?: string;
    telefono?: string;
    email: string;
    direccion?: string;
    rut?: string;
    fecha_registro: string;
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
    relacion_paciente: string;
    fecha_registro: string;
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
    rut_paciente: string;
};
export type UpdateContactoEmergenciaFormValues = Partial<
    Omit<
        ContactoEmergencia,
        "contacto_emergencia_id" | "fecha_registro" | "Paciente"
    >
> & {
    rut_paciente?: string;
};

export interface TipoAtencion {
    tipo_atencion_id: number;
    nombre_atencion: string;
    duracion_minutos: number;
    buffer_minutos: number;
}

export type CreateTipoAtencionFormValues = Omit<
    TipoAtencion,
    "tipo_atencion_id"
>;

export interface PacienteEnCita {
    paciente_id: number;
    nombre: string;
    apellido: string;
    rut?: string;
    email: string;
    fecha_nacimiento: string; // Formato 'YYYY-MM-DD'
    genero:
        | "Masculino"
        | "Femenino"
        | "No Binario"
        | "Otro"
        | "Prefiero no decir";
    fecha_registro: string;
}

export interface Cita {
    cita_id: number;
    paciente_id: number;
    tipo_atencion_id: number;
    administrador_id: number;
    fecha_hora_cita: string; // ISO string format (e.g., "2023-10-27T10:30:00Z")
    estado_cita: "Pendiente" | "Confirmada" | "Cancelada" | "Completada";
    notas?: string | null;
    fecha_creacion: string;
    Paciente?: PacienteEnCita;
    TipoAtencion?: {
        tipo_atencion_id: number;
        nombre_atencion: string;
    };
    Administrador?: {
        administrador_id: number;
        nombre: string;
        apellido: string;
        email: string;
    };
}

export type CreateCitaFormValues = Omit<
    Cita,
    "cita_id" | "fecha_creacion" | "Paciente" | "TipoAtencion" | "Administrador"
>;
export type UpdateCitaFormValues = Partial<
    Omit<Cita, "fecha_creacion" | "Paciente" | "TipoAtencion" | "Administrador">
>;

export interface TimeSlot {
    start: string;
    end: string;
}

export interface HorarioDisponible {
    horario_disponible_id: number;
    administrador_id: number;
    dia_semana: number; // 0=Domingo, 1=Lunes, ..., 6=Sábado
    hora_inicio: string; // "HH:mm"
    hora_fin: string; // "HH:mm"
    Administrador?: {
        nombre: string;
        apellido: string;
    };
}

export type CreateHorarioDisponibleData = Omit<
    HorarioDisponible,
    "horario_disponible_id" | "Administrador"
>;

export type UpdateHorarioDisponibleData = Partial<
    Omit<
        HorarioDisponible,
        "horario_disponible_id" | "administrador_id" | "Administrador"
    >
>;

export interface ExcepcionDisponibilidad {
    excepcion_id: number;
    administrador_id: number;
    fecha: string; // "YYYY-MM-DD"
    hora_inicio_bloqueo?: string; // "HH:mm"
    hora_fin_bloqueo?: string; // "HH:mm"
    es_dia_completo: boolean;
    descripcion?: string;
    Administrador?: {
        nombre: string;
        apellido: string;
    };
}
export type CreateExcepcionDisponibilidadData = Omit<
    ExcepcionDisponibilidad,
    "excepcion_id"
>;

export type UpdateExcepcionDisponibilidadData = Partial<
    Omit<
        ExcepcionDisponibilidad,
        "excepcion_id" | "administrador_id" | "Administrador"
    >
>;

// TIPOS HISTORIA CLINICA //
export interface HistoriaClinica {
    historia_clinica_id: number;
    paciente_id: number;
    fecha_creacion: string; // ISO string
    ultima_actualizacion: string; // ISO string
    Paciente?: Paciente;
}

export type CreateHistoriaClinicaData = Omit<
    HistoriaClinica,
    "historia_clinica_id" | "fecha_creacion" | "ultima_actualizacion" | "Paciente"
>;

// TIPOS ANAMNESIS //
export interface Anamnesis {
    anamnesis_id: number;
    historia_clinica_id: number;
    cita_id?: number | null;
    fecha_registro: string; // ISO string
    motivo_consulta?: string | null;
    antecedentes_personales?: string | null;
    antecedentes_familiares?: string | null;
    medicamentos_actuales?: string | null;
    alergias?: string | null;
    otros_antecedentes?: string | null;
    aqx?: string | null; // Antecedentes Quirúrgicos
    amp?: string | null; // Antecedentes Médicos Personales
    habitos_tabaco?: boolean;
    habitos_alcohol?: boolean;
    habitos_alimentacion?: string | null;
    HistoriaClinica?: {
        historia_clinica_id: number;
        paciente_id: number;
    };
    Cita?: {
        cita_id: number;
        fecha_hora_cita: string;
    };
}
export type CreateAnamnesisData = Omit<
    Anamnesis,
    "anamnesis_id" | "fecha_registro" | "HistoriaClinica" | "Cita"
>;
export type UpdateAnamnesisData = Partial<
    Omit<
        Anamnesis,
        "anamnesis_id" | "historia_clinica_id" | "fecha_registro" | "HistoriaClinica" | "Cita"
    >
>;

// EXPLORACIÓN FÍSICA //
export interface ExploracionFisica {
    exploracion_id: number;
    historia_clinica_id: number;
    cita_id?: number | null;
    fecha_registro: string; // ISO string
    hallazgos?: string | null;
    region_explorada?: string | null;
    HistoriaClinica?: {
        historia_clinica_id: number;
        paciente_id: number;
    };
    Cita?: {
        cita_id: number;
        fecha_hora_cita: string;
    };
}
export type CreateExploracionFisicaData = Omit<
    ExploracionFisica,
    "exploracion_id" | "fecha_registro" | "HistoriaClinica" | "Cita"
>;
export type UpdateExploracionFisicaData = Partial<
    Omit<
        ExploracionFisica,
        "exploracion_id" | "historia_clinica_id" | "fecha_registro" | "HistoriaClinica" | "Cita"
    >
>;

export interface Diagnostico {
    diagnostico_id: number;
    historia_clinica_id: number;
    cita_id?: number | null;
    fecha_registro: string; // ISO string
    codigo_cie?: string | null; // Código de la Clasificación Internacional de Enfermedades
    nombre_diagnostico: string;
    descripcion?: string | null;
    es_principal?: boolean;
    estado_diagnostico?: "Activo" | "Resuelto" | "Crónico" | "Inactivo";
    HistoriaClinica?: {
        historia_clinica_id: number;
        paciente_id: number;
    };
    Cita?: {
        cita_id: number;
        fecha_hora_cita: string;
    };
}

export type CreateDiagnosticoData = Omit<
    Diagnostico,
    "diagnostico_id" | "fecha_registro" | "HistoriaClinica" | "Cita"
>;

export type UpdateDiagnosticoData = Partial<
    Omit<
        Diagnostico,
        "diagnostico_id" | "historia_clinica_id" | "fecha_registro" | "HistoriaClinica" | "Cita"
    >
>;

export interface PlanTratamiento {
    plan_id: number;
    historia_clinica_id: number;
    cita_id?: number | null;
    fecha_registro: string; // ISO string
    descripcion_plan: string;
    medicamentos_recetados?: string | null;
    indicaciones_adicionales?: string | null;
    proxima_cita_recomendada?: string | null; // YYYY-MM-DD
    receta_adjunta_url?: string | null;
    HistoriaClinica?: {
        historia_clinica_id: number;
        paciente_id: number;
    };
    Cita?: {
        cita_id: number;
        fecha_hora_cita: string;
    };
}

export type CreatePlanTratamientoData = Omit<
    PlanTratamiento,
    "plan_id" | "fecha_registro" | "HistoriaClinica" | "Cita"
>;

export type UpdatePlanTratamientoData = Partial<
    Omit<
        PlanTratamiento,
        "plan_id" | "historia_clinica_id" | "fecha_registro" | "HistoriaClinica" | "Cita"
    >
>;

export interface PruebasIniciales {
  prueba_id: number;
  fecha_registro: string;
  peso: number | null;
  altura: number | null;
  imc: number | null;
  perimetro_cintura: number | null;
  perimetro_cadera: number | null;
  presion_sistolica: number | null;
  presion_diastolica: number | null;
  frecuencia_cardiaca: number | null;
  temperatura: number | null;
  saturacion_oxigeno: number | null;
  notas_adicionales: string | null;
  HistoriaClinica?: {
    historia_clinica_id: number;
    paciente_id: number;
  };
  Cita?: {
    cita_id: number;
    fecha_hora_cita: string;
  };
}

export type CreatePruebasInicialesData = Omit<
    PruebasIniciales,
    "prueba_id" | "fecha_registro" | "HistoriaClinica" | "Cita"
>;

export type UpdatePruebasInicialesData = Partial<
    Omit<
        PruebasIniciales,
        "prueba_id" | "historia_clinica_id" | "fecha_registro" | "HistoriaClinica" | "Cita"
    >
>;

export interface ApiResponse<T> {
    message: string;
    data?: T;
    errors?: any[];
}

export interface BackendError {
    path: string[];
    message: string;
}
