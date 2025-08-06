// src/components/settings/AvailabilitySettingsTab.tsx
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Loader2, Trash2, EditIcon, X } from "lucide-react";
import type { HorarioDisponible, ExcepcionDisponibilidad} from "@/types";

interface AvailabilitySettingsTabProps {
  loggedInUser: any; // Usamos 'any' aquí para simplificar, pero idealmente sería 'Administrador'
  isFetchingAvailability: boolean;
  horarios: HorarioDisponible[];
  excepciones: ExcepcionDisponibilidad[];
  dayNames: string[];

  // Props para el formulario de Horario
  newHorarioDiaSemana: string;
  setNewHorarioDiaSemana: (value: string) => void;
  newHorarioHoraInicio: string;
  setNewHorarioHoraInicio: (value: string) => void;
  newHorarioHoraFin: string;
  setNewHorarioHoraFin: (value: string) => void;
  isSavingHorario: boolean;
  handleSubmitHorarioForm: (e: React.FormEvent) => Promise<void>;
  handleDeleteHorario: (horarioId: number) => Promise<void>;
  editingHorario: HorarioDisponible | null;
  handleEditHorarioClick: (horario: HorarioDisponible) => void;
  handleCancelEditHorario: () => void;

  // Props para el formulario de Excepción
  newExcepcionFecha: string;
  setNewExcepcionFecha: (value: string) => void;
  newExcepcionEsDiaCompleto: boolean;
  setNewExcepcionEsDiaCompleto: (checked: boolean) => void;
  newExcepcionHoraInicioBloqueo: string;
  setNewExcepcionHoraInicioBloqueo: (value: string) => void;
  newExcepcionHoraFinBloqueo: string;
  setNewExcepcionHoraFinBloqueo: (value: string) => void;
  newExcepcionDescripcion: string;
  setNewExcepcionDescripcion: (value: string) => void;
  isSavingExcepcion: boolean;
  handleSubmitExcepcionForm: (e: React.FormEvent) => Promise<void>; // Renamed prop for consistency
  handleDeleteExcepcion: (excepcionId: number) => Promise<void>;
  editingExcepcion: ExcepcionDisponibilidad | null; // NEW PROP
  handleEditExcepcionClick: (excepcion: ExcepcionDisponibilidad) => void; // NEW PROP
  handleCancelEditExcepcion: () => void; // NEW PROP
}

export default function AvailabilitySettingsTab({
  isFetchingAvailability,
  horarios,
  excepciones,
  dayNames,

  newHorarioDiaSemana,
  setNewHorarioDiaSemana,
  newHorarioHoraInicio,
  setNewHorarioHoraInicio,
  newHorarioHoraFin,
  setNewHorarioHoraFin,
  isSavingHorario,
  handleSubmitHorarioForm,
  handleDeleteHorario,
  editingHorario,
  handleEditHorarioClick,
  handleCancelEditHorario,

  newExcepcionFecha,
  setNewExcepcionFecha,
  newExcepcionEsDiaCompleto,
  setNewExcepcionEsDiaCompleto,
  newExcepcionHoraInicioBloqueo,
  setNewExcepcionHoraInicioBloqueo,
  newExcepcionHoraFinBloqueo,
  setNewExcepcionHoraFinBloqueo,
  newExcepcionDescripcion,
  setNewExcepcionDescripcion,
  isSavingExcepcion,
  handleSubmitExcepcionForm, // Renamed prop
  handleDeleteExcepcion,
  editingExcepcion, // NEW PROP
  handleEditExcepcionClick, // NEW PROP
  handleCancelEditExcepcion, // NEW PROP
}: AvailabilitySettingsTabProps) {

  // Determinar qué días ya tienen un horario configurado para el administrador actual
  const scheduledDays = new Set(horarios.map(h => h.dia_semana));

  // Determinar qué fechas ya tienen una excepción configurada para el administrador actual
  const scheduledExceptionDates = new Set(excepciones.map(e => e.fecha));

  return (
    <Card className="rounded-lg shadow-md">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-semibold">Gestionar Disponibilidad</CardTitle>
        <CardDescription className="text-gray-600 dark:text-gray-400">
          Define tus horarios de trabajo regulares y gestiona días libres o excepciones.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Sección Horarios de Trabajo */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold border-b pb-2">Horarios de Trabajo Regulares</h3>
          {isFetchingAvailability ? (
            <div className="flex justify-center items-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
              <p className="ml-2 text-gray-600 dark:text-gray-400">Cargando horarios...</p>
            </div>
          ) : (
            <>
              {horarios.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400">No hay horarios de trabajo configurados.</p>
              ) : (
                <div className="grid gap-3">
                  {horarios.map((horario) => (
                    <div
                      key={horario.horario_disponible_id}
                      className="flex items-center justify-between p-3 border rounded-md bg-gray-50 dark:bg-gray-850"
                    >
                      <span>
                        {dayNames[horario.dia_semana]}: {horario.hora_inicio} - {horario.hora_fin}
                      </span>
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditHorarioClick(horario)}
                          className="text-blue-500 hover:text-blue-700"
                          disabled={isSavingHorario}
                        >
                          <EditIcon className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteHorario(horario.horario_disponible_id)}
                          className="text-red-500 hover:text-red-700"
                          disabled={isSavingHorario}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <form onSubmit={handleSubmitHorarioForm} className="space-y-3 mt-4 p-4 border rounded-md bg-gray-100 dark:bg-gray-900 relative">
                <h4 className="font-medium">{editingHorario ? "Editar Horario Existente" : "Añadir Nuevo Horario"}</h4>
                {editingHorario && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleCancelEditHorario}
                    className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <Label htmlFor="new-horario-dia">Día de la Semana</Label>
                    <Select
                      onValueChange={setNewHorarioDiaSemana}
                      value={newHorarioDiaSemana}
                      disabled={isSavingHorario || (editingHorario ? true : false)}
                    >
                      <SelectTrigger id="new-horario-dia" className="w-full rounded-md border-gray-300 dark:border-gray-700">
                        <SelectValue placeholder="Selecciona un día" />
                      </SelectTrigger>
                      <SelectContent>
                        {dayNames.map((day, index) => (
                          <SelectItem
                            key={index}
                            value={String(index)}
                            // Disable if not editing AND day is already scheduled
                            disabled={!editingHorario && scheduledDays.has(index)}
                          >
                            {day}
                            {!editingHorario && scheduledDays.has(index) && " (Ya configurado)"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="new-horario-inicio">Hora de Inicio</Label>
                    <Input
                      id="new-horario-inicio"
                      type="time"
                      value={newHorarioHoraInicio}
                      onChange={(e) => setNewHorarioHoraInicio(e.target.value)}
                      disabled={isSavingHorario}
                      className="rounded-md border-gray-300 dark:border-gray-700"
                    />
                  </div>
                  <div>
                    <Label htmlFor="new-horario-fin">Hora de Fin</Label>
                    <Input
                      id="new-horario-fin"
                      type="time"
                      value={newHorarioHoraFin}
                      onChange={(e) => setNewHorarioHoraFin(e.target.value)}
                      disabled={isSavingHorario}
                      className="rounded-md border-gray-300 dark:border-gray-700"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="submit" disabled={isSavingHorario} className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors">
                    {isSavingHorario ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    {editingHorario ? "Guardar Cambios" : "Añadir Horario"}
                  </Button>
                  {editingHorario && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCancelEditHorario}
                      disabled={isSavingHorario}
                      className="w-full sm:w-auto"
                    >
                      Cancelar Edición
                    </Button>
                  )}
                </div>
              </form>
            </>
          )}
        </div>
        {/* Sección Excepciones de Disponibilidad */}
        <div className="space-y-4 mt-8">
          <h3 className="text-lg font-semibold border-b pb-2">Días Libres y Excepciones</h3>
          {isFetchingAvailability ? (
            <div className="flex justify-center items-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
              <p className="ml-2 text-gray-600 dark:text-gray-400">Cargando excepciones...</p>
            </div>
          ) : (
            <>
              {excepciones.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400">No hay excepciones de disponibilidad configuradas.</p>
              ) : (
                <div className="grid gap-3">
                  {excepciones.map((excepcion) => (
                    <div
                      key={excepcion.excepcion_id}
                      className="flex items-center justify-between p-3 border rounded-md bg-gray-50 dark:bg-gray-850"
                    >
                      <span>
                        {excepcion.fecha} -{" "}
                        {excepcion.es_dia_completo
                          ? "Día Completo"
                          : `${excepcion.hora_inicio_bloqueo} - ${excepcion.hora_fin_bloqueo}`}
                        {excepcion.descripcion && ` (${excepcion.descripcion})`}
                      </span>
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditExcepcionClick(excepcion)}
                          className="text-blue-500 hover:text-blue-700"
                          disabled={isSavingExcepcion}
                        >
                          <EditIcon className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteExcepcion(excepcion.excepcion_id)}
                          className="text-red-500 hover:text-red-700"
                          disabled={isSavingExcepcion}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <form onSubmit={handleSubmitExcepcionForm} className="space-y-3 mt-4 p-4 border rounded-md bg-gray-100 dark:bg-gray-900 relative">
                <h4 className="font-medium">{editingExcepcion ? "Editar Excepción Existente" : "Añadir Nueva Excepción"}</h4>
                {editingExcepcion && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleCancelEditExcepcion}
                    className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="new-excepcion-fecha">Fecha</Label>
                    <Input
                      id="new-excepcion-fecha"
                      type="date"
                      value={newExcepcionFecha}
                      onChange={(e) => setNewExcepcionFecha(e.target.value)}
                      disabled={isSavingExcepcion || (editingExcepcion ? true : false)} // Disable if editing (date is fixed), or if saving
                      className="rounded-md border-gray-300 dark:border-gray-700"
                    />
                    {/* Display message if date is already scheduled and not in edit mode */}
                    {!editingExcepcion && newExcepcionFecha && scheduledExceptionDates.has(newExcepcionFecha) && (
                      <p className="text-sm text-red-500 mt-1">Ya existe una excepción para esta fecha.</p>
                    )}
                  </div>
                  <div className="flex items-center space-x-2 mt-6 sm:mt-0">
                    <Switch
                      id="new-excepcion-dia-completo"
                      checked={newExcepcionEsDiaCompleto}
                      onCheckedChange={setNewExcepcionEsDiaCompleto}
                      disabled={isSavingExcepcion}
                    />
                    <Label htmlFor="new-excepcion-dia-completo">Día Completo</Label>
                  </div>
                </div>
                {!newExcepcionEsDiaCompleto && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="new-excepcion-inicio">Hora de Inicio Bloqueo</Label>
                      <Input
                        id="new-excepcion-inicio"
                        type="time"
                        value={newExcepcionHoraInicioBloqueo}
                        onChange={(e) => setNewExcepcionHoraInicioBloqueo(e.target.value)}
                        disabled={isSavingExcepcion}
                        className="rounded-md border-gray-300 dark:border-gray-700"
                      />
                    </div>
                    <div>
                      <Label htmlFor="new-excepcion-fin">Hora de Fin Bloqueo</Label>
                      <Input
                        id="new-excepcion-fin"
                        type="time"
                        value={newExcepcionHoraFinBloqueo}
                        onChange={(e) => setNewExcepcionHoraFinBloqueo(e.target.value)}
                        disabled={isSavingExcepcion}
                        className="rounded-md border-gray-300 dark:border-gray-700"
                      />
                    </div>
                  </div>
                )}
                <div>
                  <Label htmlFor="new-excepcion-descripcion">Descripción (Opcional)</Label>
                  <Input
                    id="new-excepcion-descripcion"
                    type="text"
                    value={newExcepcionDescripcion}
                    onChange={(e) => setNewExcepcionDescripcion(e.target.value)}
                    disabled={isSavingExcepcion}
                    className="rounded-md border-gray-300 dark:border-gray-700"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="submit" disabled={isSavingExcepcion} className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors">
                    {isSavingExcepcion ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    {editingExcepcion ? "Guardar Cambios" : "Añadir Excepción"}
                  </Button>
                  {editingExcepcion && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCancelEditExcepcion}
                      disabled={isSavingExcepcion}
                      className="w-full sm:w-auto"
                    >
                      Cancelar Edición
                    </Button>
                  )}
                </div>
              </form>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
