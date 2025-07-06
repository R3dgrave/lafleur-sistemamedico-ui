import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom"; // Para volver al login

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

// Esquema de validación con Zod para el email de recuperación
const forgotPasswordSchema = z.object({
  email: z
    .string()
    .email("Formato de email inválido")
    .min(1, "El email es requerido"),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    try {
      const response = await api.post("/autenticacion/olvide-contrasena", {
        email: data.email,
      });

      // El backend siempre devuelve un 200 OK con un mensaje genérico por seguridad
      toast.success(
        response.data.message ||
          "Si el correo electrónico existe, se ha enviado un enlace para restablecer la contraseña."
      );
      navigate("/"); // Opcional: redirigir al login después de enviar la solicitud
    } catch (error: any) {
      console.error(
        "Error al solicitar restablecimiento de contraseña:",
        error
      );
      // Aunque el backend envía un mensaje genérico en éxito, aquí puedes mostrar un error más específico si la red falla o hay un error 500
      toast.error(
        error.response?.data?.message ||
          "Ocurrió un error inesperado al solicitar el restablecimiento de contraseña."
      );
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-900">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">
            ¿Olvidaste tu Contraseña?
          </CardTitle>
          <CardDescription className="text-center">
            Introduce tu dirección de correo electrónico y te enviaremos un
            enlace para restablecer tu contraseña.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@ejemplo.com"
                {...register("email")}
                disabled={isSubmitting}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting
                ? "Enviando..."
                : "Enviar Enlace de Restablecimiento"}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            <Button variant="link" onClick={() => navigate("/")}>
              Volver al inicio de sesión
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ForgotPasswordPage;
