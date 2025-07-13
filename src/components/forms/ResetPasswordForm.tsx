import React from 'react';
import { useFormContext } from 'react-hook-form';
import { z } from 'zod';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { resetPasswordSchema } from '@/lib/validation';

interface ResetPasswordFormProps {
  isSubmitting: boolean;
}

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({
  isSubmitting,
}) => {
  const { register, formState: { errors } } = useFormContext<ResetPasswordFormValues>();

  return (
    // <form className="grid gap-4"> <-- REMOVE the <form> tag here
    <div className="grid gap-4">
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
    </div>
  );
};

export default ResetPasswordForm;