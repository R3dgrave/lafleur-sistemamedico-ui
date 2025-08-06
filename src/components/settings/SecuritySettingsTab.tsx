// src/components/settings/SecuritySettingsTab.tsx
import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import type { UpdatePasswordData } from "@/types";

interface SecuritySettingsTabProps {
  currentPassword: string;
  setCurrentPassword: (value: string) => void;
  newPassword: string;
  setNewPassword: (value: string) => void;
  confirmNewPassword: string;
  setConfirmNewPassword: (value: string) => void;
  passwordError: string | null;
  isSaving: boolean;
  handleChangePassword: (e: React.FormEvent) => Promise<void>;
}

export default function SecuritySettingsTab({
  currentPassword,
  setCurrentPassword,
  newPassword,
  setNewPassword,
  confirmNewPassword,
  setConfirmNewPassword,
  passwordError,
  isSaving,
  handleChangePassword,
}: SecuritySettingsTabProps) {
  return (
    <Card className="rounded-lg shadow-md">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-semibold">
          Cambiar Contraseña
        </CardTitle>
        <CardDescription className="text-gray-600 dark:text-gray-400">
          Asegúrate de que tu cuenta esté segura utilizando una contraseña
          fuerte.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleChangePassword} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current-password">Contraseña Actual</Label>
            <Input
              id="current-password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              disabled={isSaving}
              className="rounded-md border-gray-300 dark:border-gray-700"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-password">Nueva Contraseña</Label>
            <Input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              disabled={isSaving}
              className="rounded-md border-gray-300 dark:border-gray-700"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-new-password">
              Confirmar Nueva Contraseña
            </Label>
            <Input
              id="confirm-new-password"
              type="password"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              required
              disabled={isSaving}
              className="rounded-md border-gray-300 dark:border-gray-700"
            />
          </div>
          {passwordError && (
            <p className="text-red-500 text-sm">{passwordError}</p>
          )}
          <Button
            type="submit"
            disabled={isSaving}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
          >
            {isSaving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Actualizar Contraseña
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
