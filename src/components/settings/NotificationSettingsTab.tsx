// src/components/settings/NotificationSettingsTab.tsx
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Loader2 } from "lucide-react";

interface NotificationSettingsTabProps {
  receiveEmailNotifications: boolean;
  setReceiveEmailNotifications: (checked: boolean) => void;
  receiveSmsNotifications: boolean;
  setReceiveSmsNotifications: (checked: boolean) => void;
  isSaving: boolean;
  handleUpdateNotifications: () => Promise<void>;
}

export default function NotificationSettingsTab({
  receiveEmailNotifications,
  setReceiveEmailNotifications,
  receiveSmsNotifications,
  setReceiveSmsNotifications,
  isSaving,
  handleUpdateNotifications,
}: NotificationSettingsTabProps) {
  return (
    <Card className="rounded-lg shadow-md">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-semibold">
          Preferencias de Notificación
        </CardTitle>
        <CardDescription className="text-gray-600 dark:text-gray-400">
          Controla cómo recibes las notificaciones.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between space-x-2 p-3 border rounded-md bg-gray-50 dark:bg-gray-850">
          <Label
            htmlFor="email-notifications"
            className="flex flex-col space-y-1 cursor-pointer"
          >
            <span className="text-base font-medium">
              Notificaciones por Correo Electrónico
            </span>
            <span className="font-normal leading-snug text-muted-foreground text-sm">
              Recibe actualizaciones importantes y recordatorios por correo.
            </span>
          </Label>
          <Switch
            id="email-notifications"
            checked={receiveEmailNotifications}
            onCheckedChange={setReceiveEmailNotifications}
            disabled={isSaving}
          />
        </div>
        <div className="flex items-center justify-between space-x-2 p-3 border rounded-md bg-gray-50 dark:bg-gray-850">
          <Label
            htmlFor="sms-notifications"
            className="flex flex-col space-y-1 cursor-pointer"
          >
            <span className="text-base font-medium">
              Notificaciones por SMS
            </span>
            <span className="font-normal leading-snug text-muted-foreground text-sm">
              Recibe recordatorios de citas y alertas por mensaje de texto.
            </span>
          </Label>
          <Switch
            id="sms-notifications"
            checked={receiveSmsNotifications}
            onCheckedChange={setReceiveSmsNotifications}
            disabled={isSaving}
          />
        </div>
        <Button
          onClick={handleUpdateNotifications}
          disabled={isSaving}
          className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
        >
          {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Guardar Preferencias
        </Button>
      </CardContent>
    </Card>
  );
}
