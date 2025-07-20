import { z } from "zod";

export const administradorSchema = z.object({
  nombre: z
    .string()
    .min(1, "El nombre deber tener al menos 1 caracter")
    .max(100, "El(Los) nombre(s) no puede(n) tener más de 100 caracteres"),
  apellido: z
    .string()
    .min(1, "El apellido es obligatorio")
    .max(100, "El(Los) apellido(s) no puede(n) tener más de 100 caracteres"),
  email: z
    .string()
    .email("Email invalido")
    .regex(/^((?!\.)[\w-_.]*[^.])(@\w+)(\.\w+(\.\w+)?[^.\W])$/gim),
  password_hash: z
    .string()
    .min(6, "La contraseña debe tener al menos 6 caracteres")
    .max(225, "La contraseña no puede tener más de 225 caracteres"),
});

export const loginSchema = z.object({
  email: z
    .string()
    .email("Email invalido")
    .regex(/^((?!\.)[\w-_.]*[^.])(@\w+)(\.\w+(\.\w+)?[^.\W])$/gim),
  password_hash: z
    .string()
    .min(6, "La contraseña debe tener al menos 6 caracteres")
    .max(225, "La contraseña no puede tener más de 225 caracteres"),
});

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .email("Formato de email inválido")
    .min(1, "El email es requerido"),
});

export const resetPasswordSchema = z
  .object({
    newPassword: z
      .string()
      .min(6, "La contraseña debe tener al menos 6 caracteres"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

export const createPacienteSchema = z.object({
  nombre: z
    .string()
    .min(1, "El nombre es requerido")
    .max(100, "Máximo 100 caracteres"),
  apellido: z
    .string()
    .min(1, "El apellido es requerido")
    .max(100, "Máximo 100 caracteres"),
  fecha_nacimiento: z.string().min(1, "La fecha de nacimiento es requerida"),
  genero: z.string().min(1, "El género es requerido"),
  identidad_genero: z.string().optional(),
  sexo_registral: z.string().optional(),
  telefono: z.string().optional(),
  email: z
    .string()
    .email("Formato de email inválido")
    .min(1, "El email es requerido"),
  direccion: z.string().optional(),
  rut: z.string().optional(),
});

export const updatePacienteSchema = createPacienteSchema.partial();

export const createContactoEmergenciaSchema = z.object({
  rut_paciente: z.string().min(1, "El RUT del paciente es requerido"),
  nombre_contacto: z
    .string()
    .min(1, "El nombre del contacto es requerido")
    .max(100, "Máximo 100 caracteres"),
  telefono_contacto: z
    .string()
    .min(1, "El teléfono del contacto es requerido")
    .max(20, "Máximo 20 caracteres"),
  relacion_paciente: z.string().optional(),
});

export const updateContactoEmergenciaSchema =
  createContactoEmergenciaSchema.partial();
