// src/validations/validationSchemas.ts
import { z } from "zod";

// =================================================================
// === VALIDACIONES REUTILIZABLES ===
// =================================================================

// Valida que el string no esté vacío y tenga un mensaje personalizado.
const stringRequired = (message: string) => z.string().min(1, message);

// Validaciones comunes para nombres y apellidos
const nombreString = z
  .string()
  .trim()
  .min(2, "El nombre debe tener al menos 2 caracteres.")
  .max(50, "El nombre no puede exceder los 50 caracteres.")
  .regex(
    /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/,
    "El nombre solo puede contener letras y espacios."
  );

const apellidoString = z
  .string()
  .trim()
  .min(2, "El apellido debe tener al menos 2 caracteres.")
  .max(50, "El apellido no puede exceder los 50 caracteres.")
  .regex(
    /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/,
    "El apellido solo puede contener letras y espacios."
  );

// Validaciones para email
const emailString = z
  .string()
  .min(1, "Email es requerido")
  .trim()
  .toLowerCase()
  .email("Formato de email inválido.");

// Validaciones para contraseñas
const passwordString = z
  .string()
  .min(6, "La contraseña debe tener al menos 6 caracteres")
  .max(225, "La contraseña no puede tener más de 225 caracteres");

// Validaciones para teléfono
const telefonoString = z
  .string()
  .trim()
  .min(8, "El teléfono debe tener al menos 8 dígitos.")
  .max(15, "El teléfono no puede exceder los 15 dígitos.")
  .regex(
    /^\+?\d{8,15}$/,
    "Formato de teléfono inválido. Use solo números y opcionalmente un '+' al inicio."
  );

// Validaciones para RUT
const cleanAndValidateRutFormat = (rut: string) => {
  const cleanedRut = rut.replace(/\./g, "").replace(/-/g, "");
  return /^\d{7,8}[0-9Kk]$/.test(cleanedRut);
};

const validateRutDigit = (rut: string) => {
  const cleanedRut = rut.replace(/\./g, "").replace(/-/g, "");
  const body = cleanedRut.slice(0, -1);
  const dv = cleanedRut.slice(-1).toUpperCase();

  if (body.length < 7 || body.length > 8) {
    return false;
  }

  let sum = 0;
  let multiplier = 2;
  for (let i = body.length - 1; i >= 0; i--) {
    sum += parseInt(body[i], 10) * multiplier;
    multiplier++;
    if (multiplier > 7) {
      multiplier = 2;
    }
  }

  const remainder = sum % 11;
  const calculatedDv = 11 - remainder;

  let expectedDv;
  if (calculatedDv === 11) {
    expectedDv = "0";
  } else if (calculatedDv === 10) {
    expectedDv = "K";
  } else {
    expectedDv = String(calculatedDv);
  }

  return expectedDv === dv;
};

// Esquema Zod reutilizable para el RUT
const rutSchema = z
  .string()
  .trim()
  .min(1, "El RUT es requerido.")
  .refine((rut) => cleanAndValidateRutFormat(rut), {
    message: "Formato de RUT incorrecto. Ej: 12.345.678-9.",
  })
  .refine((rut) => validateRutDigit(rut), {
    message: "RUT inválido. El dígito verificador no coincide.",
  });

// Esquemas reutilizables para IDs numéricos
const idNumber = z.number().int().positive();

// =================================================================
// === ENUMS REUTILIZABLES ===
// =================================================================
const GENERO_ENUM = [
  "Masculino",
  "Femenino",
  "No Binario",
  "Otro",
  "Prefiero no decir",
] as const;
const CITA_ESTADO_ENUM = [
  "Pendiente",
  "Confirmada",
  "Cancelada",
  "Completada",
] as const;
const DIAGNOSTICO_ESTADO_ENUM = [
  "Activo",
  "Resuelto",
  "Crónico",
  "Inactivo",
] as const;

// =================================================================
// === ESQUEMAS DE ADMINISTRADOR ===
// =================================================================
export const administradorSchema = z.object({
  nombre: stringRequired("El nombre es obligatorio."),
  apellido: stringRequired("El apellido es obligatorio."),
  email: emailString,
  password_hash: passwordString,
});

export const loginSchema = z.object({
  email: stringRequired("Ingrese su email").and(emailString),
  password_hash: passwordString.min(6, "Ingrese su contraseña"),
});

export const forgotPasswordSchema = z.object({
  email: stringRequired("El email es requerido.").and(emailString),
});

export const resetPasswordSchema = z
  .object({
    newPassword: passwordString,
    confirmPassword: stringRequired("La confirmación de la contraseña es requerida."),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

// =================================================================
// === ESQUEMAS DE PACIENTES ===
// =================================================================
const pacienteBaseSchema = z.object({
  nombre: nombreString,
  apellido: apellidoString,
  fecha_nacimiento: z
    .string()
    .min(1, "La fecha de nacimiento es requerida.")
    .refine(
      (val) => {
        const date = new Date(val);
        return !isNaN(date.getTime()) && date <= new Date();
      },
      "La fecha de nacimiento debe ser una fecha válida y no puede ser en el futuro."
    )
    .transform((val) => new Date(val).toISOString().split("T")[0]),
  genero: z.enum(GENERO_ENUM, {
    message: "Género inválido.",
  }),
  email: emailString.min(1, "El email es requerido."),
  telefono: telefonoString,
  direccion: z.string().trim().min(5, "La direccion es requerida").max(200).optional(),
  identidad_genero: z.string().trim().max(50).optional(),
  sexo_registral: z.string().trim().max(50).optional(),
});

export const createPacienteSchema = pacienteBaseSchema.extend({
  rut: rutSchema,
});

export const updatePacienteSchema = createPacienteSchema.partial();

// =================================================================
// === ESQUEMAS DE CONTACTO DE EMERGENCIA ===
// =================================================================
export const createContactoEmergenciaSchema = z.object({
  rut_paciente: stringRequired("El RUT del paciente es requerido"),
  nombre_contacto: stringRequired("El nombre del contacto es requerido").max(100),
  telefono_contacto: stringRequired("El teléfono del contacto es requerido").max(20),
  relacion_paciente: z.string().optional(),
});

export const updateContactoEmergenciaSchema = createContactoEmergenciaSchema.partial();

// =================================================================
// === ESQUEMAS DE CITAS ===
// =================================================================
const citaBaseSchema = z.object({
  paciente_id: idNumber.optional(),
  administrador_id: idNumber.optional(),
  tipo_atencion_id: idNumber.optional(),
  fecha_hora_cita: z
    .string()
    .datetime({
      message:
        "Formato de fecha y hora inválido. Usa 'YYYY-MM-DDTHH:MM:SSZ' o similar.",
    }),
  estado_cita: z
    .enum(CITA_ESTADO_ENUM, {
      message: "Estado de cita inválido",
    })
    .default("Pendiente"),
  notas: z.string().optional().nullable(),
});

export const createCitaSchema = citaBaseSchema.extend({
  paciente_id: idNumber.min(1, "El ID del paciente es requerido."),
  administrador_id: idNumber.min(1, "El ID del administrador es requerido."),
  tipo_atencion_id: idNumber.min(1, "El ID del tipo de atención es requerido."),
});

export const updateCitaSchema = citaBaseSchema.partial();

// =================================================================
// === ESQUEMAS DE TIPOS ATENCION ===
// =================================================================
export const createTipoAtencionSchema = z.object({
  nombre_atencion: stringRequired("El nombre del tipo de atención es requerido").max(50),
});

// =================================================================
// === ESQUEMAS DE HISTORIAL CLÍNICO ===
// =================================================================
const historialClinicoBaseSchema = z.object({
  cita_id: idNumber.optional().nullable(),
});

export const anamnesisFormSchema = historialClinicoBaseSchema.extend({
  motivo_consulta: z.string().trim().max(1000).optional().nullable(),
  antecedentes_personales: z.string().trim().max(2000).optional().nullable(),
  antecedentes_familiares: z.string().trim().max(2000).optional().nullable(),
  medicamentos_actuales: z.string().trim().max(1000).optional().nullable(),
  alergias: z.string().trim().max(1000).optional().nullable(),
  otros_antecedentes: z.string().trim().max(2000).optional().nullable(),
  aqx: z.string().trim().max(1000).optional().nullable(),
  amp: z.string().trim().max(1000).optional().nullable(),
  habitos_tabaco: z.boolean().optional(),
  habitos_alcohol: z.boolean().optional(),
  habitos_alimentacion: z.string().trim().max(1000).optional().nullable(),
}).refine((data) => data.motivo_consulta?.trim() !== "" ||
    data.antecedentes_personales?.trim() !== "" ||
    data.antecedentes_familiares?.trim() !== "" ||
    data.medicamentos_actuales?.trim() !== "" ||
    data.alergias?.trim() !== "" ||
    data.otros_antecedentes?.trim() !== "" ||
    data.aqx?.trim() !== "" ||
    data.amp?.trim() !== "" ||
    data.habitos_tabaco ||
    data.habitos_alcohol ||
    data.habitos_alimentacion?.trim() !== "",
  {
    message: "Debes completar al menos uno de los campos para guardar la anamnesis.",
    path: ["motivo_consulta"],
});

export const exploracionFisicaFormSchema = historialClinicoBaseSchema.extend({
  hallazgos: z.string().trim().max(3000).optional().nullable(),
  region_explorada: z.string().trim().max(100).optional().nullable(),
}).refine((data) => data.hallazgos?.trim() !== "" || data.region_explorada?.trim() !== "", {
    message: "Debes completar al menos uno de los campos para guardar el registro de exploración física.",
    path: ["hallazgos"],
});

export const diagnosticoFormSchema = historialClinicoBaseSchema.extend({
  codigo_cie: z.string().trim().max(20).optional().nullable(),
  nombre_diagnostico: stringRequired("El nombre del diagnóstico es requerido.").max(255),
  descripcion: z.string().trim().max(2000).optional().nullable(),
  es_principal: z.boolean().default(false).optional(),
  estado_diagnostico: z
    .enum(DIAGNOSTICO_ESTADO_ENUM, {
      message: "Estado de diagnóstico inválido.",
    })
    .default("Activo")
    .optional(),
});

export const planTratamientoFormSchema = historialClinicoBaseSchema.extend({
  cita_id: z.number().optional().nullable(),
  descripcion_plan: stringRequired("La descripción del plan es requerida.").max(2000),
  medicamentos_recetados: z.string().trim().max(1000).optional().nullable(),
  indicaciones_adicionales: z.string().trim().max(2000).optional().nullable(),
  // SOLUCIÓN CLAVE: Modificamos el esquema para que acepte 'string | null | undefined'
  proxima_cita_recomendada: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Formato de fecha inválido (YYYY-MM-DD)").optional().nullable(),
  receta_adjunta_url: z
    .string()
    .url("URL de receta adjunta inválida.")
    .max(255)
    .optional()
    .nullable(),
});

export const pruebasInicialesFormSchema = z.object({
  peso: z.string().refine(val => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
    message: "El peso debe ser un número positivo."
  }).optional(),
  altura: z.string().refine(val => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
    message: "La altura debe ser un número positivo."
  }).optional(),
  perimetro_cintura: z.string().refine(val => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
    message: "El perímetro de la cintura debe ser un número positivo."
  }).optional(),
  perimetro_cadera: z.string().refine(val => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
    message: "El perímetro de la cadera debe ser un número positivo."
  }).optional(),
  presion_sistolica: z.string().refine(val => !isNaN(parseInt(val)) && parseInt(val) > 0, {
    message: "La presión sistólica debe ser un número entero positivo."
  }).optional(),
  presion_diastolica: z.string().refine(val => !isNaN(parseInt(val)) && parseInt(val) > 0, {
    message: "La presión diastólica debe ser un número entero positivo."
  }).optional(),
  frecuencia_cardiaca: z.string().refine(val => !isNaN(parseInt(val)) && parseInt(val) > 0, {
    message: "La frecuencia cardiaca debe ser un número entero positivo."
  }).optional(),
  temperatura: z.string().refine(val => !isNaN(parseFloat(val)), {
    message: "La temperatura debe ser un número válido."
  }).optional(),
  saturacion_oxigeno: z.string().refine(val => !isNaN(parseFloat(val)) && parseFloat(val) > 0 && parseFloat(val) <= 100, {
    message: "La saturación de oxígeno debe ser un número entre 0 y 100."
  }).optional(),
  notas_adicionales: z.string().optional(),
});