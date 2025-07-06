import React from "react";
import { useFormContext } from "react-hook-form";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { loginSchema } from "../../lib/validation";

interface LoginFormProps {
  isSubmitting: boolean;
  onForgotPasswordClick: () => void;
}

type LoginFormValues = z.infer<typeof loginSchema>;

const LoginForm: React.FC<LoginFormProps> = ({
  isSubmitting,
  onForgotPasswordClick,
}) => {
  const {
    register,
    formState: { errors },
  } = useFormContext<LoginFormValues>();

  return (
    <form className="grid gap-6">
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
      <div className="grid gap-2">
        <Label htmlFor="password_hash">Contraseña</Label>
        <Input
          id="password_hash"
          type="password"
          placeholder="******"
          {...register("password_hash")}
          disabled={isSubmitting}
        />
        {errors.password_hash && (
          <p className="text-sm text-red-500">{errors.password_hash.message}</p>
        )}
      </div>
      <Button
        type="submit" // Este botón ahora está dentro del formulario
        className="w-full cursor-pointer"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Iniciando sesión..." : "Iniciar Sesión"}
      </Button>
      <div className="mt-4 text-center text-sm">
        <Button
          variant="link"
          className="cursor-pointer"
          onClick={onForgotPasswordClick}
        >
          ¿Olvidaste tu contraseña?
        </Button>
      </div>
    </form>
  );
};

export default LoginForm;
