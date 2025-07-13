import React from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { forgotPasswordSchema } from "@/lib/validation";
import api from "@/lib/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import ForgotPasswordForm from "@/components/forms/ForgotPasswordForm";

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();

  const methods = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    try {
      const response = await api.post("/autenticacion/olvide-contrasena", {
        email: data.email,
      });

      toast.success(
        response.data.message ||
          "Si el correo electrónico existe, se ha enviado un enlace para restablecer la contraseña."
      );
      navigate("/");
    } catch (error: any) {
      console.error(
        "Error al solicitar restablecimiento de contraseña:",
        error
      );
      toast.error(
        error.response?.data?.message ||
          "Ocurrió un error inesperado al solicitar el restablecimiento de contraseña."
      );
    }
  };

  const handleBackToLoginClick = () => {
    navigate("/");
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
          <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)}>
              <ForgotPasswordForm
                isSubmitting={isSubmitting}
                onBackToLoginClick={handleBackToLoginClick}
              />
            </form>
          </FormProvider>
        </CardContent>
      </Card>
    </div>
  );
};

export default ForgotPasswordPage;
