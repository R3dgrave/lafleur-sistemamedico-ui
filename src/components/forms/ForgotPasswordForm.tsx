import React from "react";
import { useFormContext } from "react-hook-form";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { forgotPasswordSchema } from "@/lib/validation";

interface ForgotPasswordFormProps {
  isSubmitting: boolean;
  onBackToLoginClick: () => void;
}

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({
  isSubmitting,
  onBackToLoginClick,
}) => {
  const {
    register,
    formState: { errors },
  } = useFormContext<ForgotPasswordFormValues>();

  return (
    <form className="grid gap-4">
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
        {isSubmitting ? "Enviando..." : "Enviar Enlace de Restablecimiento"}
      </Button>
      <div className="mt-4 text-center text-sm">
        <Button variant="link" onClick={onBackToLoginClick}>
          Volver al inicio de sesión
        </Button>
      </div>
    </form>
  );
};

export default ForgotPasswordForm;
