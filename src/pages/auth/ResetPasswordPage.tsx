import React from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";
import { resetPasswordSchema } from "@/lib/validation";
import api from "@/lib/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import ResetPasswordForm from "@/components/authForms/ResetPasswordForm";

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const { token } = useParams<{ token: string }>();

  const methods = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

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
      navigate("/");
    } catch (error: any) {
      console.error("Error al restablecer contraseña:", error);
      toast.error(
        error.response?.data?.message ||
          "Ocurrió un error al restablecer la contraseña."
      );
      if (error.response?.status === 400) {
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
          <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)}>
              <ResetPasswordForm isSubmitting={isSubmitting} />
            </form>
          </FormProvider>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPasswordPage;
