import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom"; // Importa useParams

// Componentes de shadcn/ui
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import api from "@/lib/api"; // Tu instancia de Axios

// Esquema de validación con Zod para la nueva contraseña
const resetPasswordSchema = z
  .object({
    newPassword: z
      .string()
      .min(6, "La contraseña debe tener al menos 6 caracteres"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"], // Muestra el error en el campo de confirmación
  });

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const { token } = useParams<{ token: string }>(); // Obtiene el token de la URL

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: ResetPasswordFormValues) => {
    if (!token) {
      toast.error("Token de restablecimiento no encontrado en la URL.");
      navigate("/");
      return;
    }

    try {
      const response = await api.post(
        `/autenticacion/restablecer-contrasena/${token}`,
        {
          password_hash: data.newPassword,
        }
      );
      console.log(response);

      toast.success(
        response.data.message || "Contraseña restablecida exitosamente."
      );
      navigate("/"); // Redirige al login después de restablecer
    } catch (error: any) {
      console.error("Error al restablecer contraseña:", error);
      toast.error(
        error.response?.data?.message ||
          "Ocurrió un error al restablecer la contraseña."
      );
      // Si el token es inválido o expirado, el backend debería devolver un 400
      if (error.response?.status === 400) {
        // Puedes redirigir al usuario a la página de "Olvidé mi contraseña" para que solicite uno nuevo
        navigate("/olvide-contrasena");
      }
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-900">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">
            Restablecer Contraseña
          </CardTitle>
          <CardDescription className="text-center">
            Introduce tu nueva contraseña.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="newPassword">Nueva Contraseña</Label>
              <Input
                id="newPassword"
                type="password"
                {...register("newPassword")}
                disabled={isSubmitting}
              />
              {errors.newPassword && (
                <p className="text-sm text-red-500">
                  {errors.newPassword.message}
                </p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
              <Input
                id="confirmPassword"
                type="password"
                {...register("confirmPassword")}
                disabled={isSubmitting}
              />
              {errors.confirmPassword && (
                <p className="text-sm text-red-500">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Restableciendo..." : "Restablecer Contraseña"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPasswordPage;
