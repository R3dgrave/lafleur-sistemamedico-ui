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
