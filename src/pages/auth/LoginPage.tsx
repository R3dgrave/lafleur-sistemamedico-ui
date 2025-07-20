import React from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { loginSchema } from "@/lib/validation";
import api from "@/lib/api";
import useAuthStore from "@/store/authStore";
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import LoginForm from "@/components/authForms/LoginForm";

type LoginFormValues = z.infer<typeof loginSchema>;

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const methods = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password_hash: "",
    },
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
    setError,
  } = methods;

  const onSubmit = async (data: LoginFormValues) => {
    try {
      const response = await api.post("/autenticacion/inicio-sesion", {
        email: data.email,
        password_hash: data.password_hash,
      });

      const { accessToken, user } = response.data;
      login(accessToken, user);

      toast.success("¡Inicio de sesión exitoso!");
      navigate("/pacientes");
    } catch (error: any) {
      console.error("Error al iniciar sesión:", error);
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        toast.error(`Error: ${error.response.data.message}`);
        if (error.response.data.errors) {
          error.response.data.errors.forEach((err: any) => {
            if (err.path === "email") {
              setError("email", { type: "manual", message: err.message });
            } else if (err.path === "password_hash") {
              setError("password_hash", {
                type: "manual",
                message: err.message,
              });
            }
          });
        }
      } else {
        toast.error("Ocurrió un error inesperado al iniciar sesión.");
      }
    }
  };

  const handleForgotPasswordClick = () => {
    navigate("/olvide-contrasena");
  };

  return (
    <div className="flex flex-row min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="hidden lg:flex lg:w-1/2 h-[100vh] bg-white dark:bg-gray-800">
        <img
          src="./lafleur_logo.png"
          alt="Logo Lafleur"
          className="w-full object-cover aspect-square"
        />
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex justify-center items-center mb-6">
            <img
              src="./lafleur_logo.png"
              alt="Logo Lafleur"
              className="h-60 object-cover"
            />
          </div>
          <CardHeader className="flex flex-col gap-y-6 items-center">
            <CardTitle className="text-4xl text-center">
              ¡BIENVENIDA DE NUEVO!
            </CardTitle>
            <CardDescription className="text-center pb-4">
              Introduce tus credenciales para acceder a tu cuenta.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormProvider {...methods}>
              <form onSubmit={handleSubmit(onSubmit)}>
                <LoginForm
                  isSubmitting={isSubmitting}
                  onForgotPasswordClick={handleForgotPasswordClick}
                />
              </form>
            </FormProvider>
          </CardContent>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
