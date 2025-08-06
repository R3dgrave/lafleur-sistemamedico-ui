// src/components/settings/AppearanceSettingsTab.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ModeToggle } from "@/components/toggle/mode-toggle";

export default function AppearanceSettingsTab() {
  return (
    <Card className="rounded-lg shadow-md">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-semibold">Apariencia</CardTitle>
        <CardDescription className="text-gray-600 dark:text-gray-400">
          Personaliza la interfaz de usuario.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between space-x-2">
          <Label
            htmlFor="theme-toggle"
            className="flex flex-col space-y-1"
          >
            <span>Modo Oscuro / Claro</span>
            <span className="font-normal leading-snug text-muted-foreground">
              Alterna entre el tema claro y oscuro de la aplicación.
            </span>
          </Label>
          <ModeToggle />
        </div>
      </CardContent>
    </Card>
  );
}
