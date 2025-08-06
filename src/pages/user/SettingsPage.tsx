// src/pages/SettingsPage.tsx
import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, XCircle } from "lucide-react";
import { administratorService } from "@/services/administratorService";
import type {
  UpdatePasswordData,
  UpdateNotificationPreferencesData,
  HorarioDisponible,
  ExcepcionDisponibilidad,
  CreateHorarioDisponibleData,
  CreateExcepcionDisponibilidadData,
  Administrador,
  UpdateHorarioDisponibleData,
  UpdateExcepcionDisponibilidadData, // ¡NUEVA IMPORTACIÓN!
} from "@/types";
import useAuthStore from "@/store/authStore";
import { toast } from "react-toastify";

// Importar los nuevos sub-componentes
import SecuritySettingsTab from "@/components/settings/SecuritySettingsTab";
import NotificationSettingsTab from "@/components/settings/NotificationSettingsTab";
import AvailabilitySettingsTab from "@/components/settings/AvailabilitySettingsTab";
import AppearanceSettingsTab from "@/components/settings/AppearanceSettingsTab";

export default function SettingsPage() {
  const {
    user: loggedInUser,
    isLoading: isLoadingAuth,
    updateUserInStore,
  } = useAuthStore();
  
  // Estados para el formulario de cambio de contraseña
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Estados para preferencias de notificación
  const [receiveEmailNotifications, setReceiveEmailNotifications] = useState(true);
  const [receiveSmsNotifications, setReceiveSmsNotifications] = useState(false);

  // Estados para horarios de trabajo
  const [horarios, setHorarios] = useState<HorarioDisponible[]>([]);
  const [editingHorario, setEditingHorario] = useState<HorarioDisponible | null>(null);
  const [newHorarioDiaSemana, setNewHorarioDiaSemana] = useState<string>("");
  const [newHorarioHoraInicio, setNewHorarioHoraInicio] = useState("");
  const [newHorarioHoraFin, setNewHorarioHoraFin] = useState("");
  const [isSavingHorario, setIsSavingHorario] = useState(false);

  // Estados para excepciones de disponibilidad
  const [excepciones, setExcepciones] = useState<ExcepcionDisponibilidad[]>([]);
  const [editingExcepcion, setEditingExcepcion] = useState<ExcepcionDisponibilidad | null>(null); // NEW STATE for editing
  const [newExcepcionFecha, setNewExcepcionFecha] = useState("");
  const [newExcepcionEsDiaCompleto, setNewExcepcionEsDiaCompleto] = useState(false);
  const [newExcepcionHoraInicioBloqueo, setNewExcepcionHoraInicioBloqueo] = useState("");
  const [newExcepcionHoraFinBloqueo, setNewExcepcionHoraFinBloqueo] = useState("");
  const [newExcepcionDescripcion, setNewExcepcionDescripcion] = useState("");
  const [isSavingExcepcion, setIsSavingExcepcion] = useState(false);

  const [isSaving, setIsSaving] = useState(false); // Estado general de guardado para password/notifications
  const [isFetchingAvailability, setIsFetchingAvailability] = useState(false); // Estado para la carga de horarios/excepciones

  // Mapeo de números de día a nombres de día
  const dayNames = [
    "Domingo",
    "Lunes",
    "Martes",
    "Miércoles",
    "Jueves",
    "Viernes",
    "Sábado",
  ];

  // Función para cargar horarios y excepciones
  const fetchAvailabilityData = useCallback(async () => {
    if (!loggedInUser?.administrador_id) return;
    setIsFetchingAvailability(true);
    try {
      const [horariosData, excepcionesData] = await Promise.all([
        administratorService.getAllHorariosDisponibles(),
        administratorService.getAllExcepcionesDisponibilidad(),
      ]);
      setHorarios(horariosData);
      setExcepciones(excepcionesData);
    } catch (error) {
      toast.error("Error al cargar los datos de disponibilidad.");
    } finally {
      setIsFetchingAvailability(false);
    }
  }, [loggedInUser]);

  // Efecto para inicializar las preferencias de notificación y cargar horarios/excepciones
  useEffect(() => {
    if (loggedInUser) {
      setReceiveEmailNotifications(
        loggedInUser.receive_email_notifications ?? true
      );
      setReceiveSmsNotifications(
        loggedInUser.receive_sms_notifications ?? false
      );
      fetchAvailabilityData(); // Cargar horarios y excepciones al cargar el usuario
    }
  }, [loggedInUser, fetchAvailabilityData]);

  // Manejador para cambiar la contraseña
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setPasswordError(null);

    if (newPassword !== confirmNewPassword) {
      setPasswordError("Las nuevas contraseñas no coinciden.");
      setIsSaving(false);
      return;
    }

    try {
      const data: UpdatePasswordData = {
        current_password: currentPassword,
        new_password: newPassword,
        confirm_new_password: confirmNewPassword,
      };
      await administratorService.updateAdminPassword(data);
      toast.success("Contraseña actualizada exitosamente.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    } catch (err: any) {
      console.error("Error changing password:", err);
      setPasswordError(
        err.response?.data?.message || "Error al actualizar la contraseña."
      );
      toast.error(
        err.response?.data?.message || "Error al actualizar la contraseña."
      );
    } finally {
      setIsSaving(false);
    }
  };

  // Manejador para actualizar preferencias de notificación
  const handleUpdateNotifications = async () => {
    setIsSaving(true);
    setPasswordError(null);

    try {
      const data: UpdateNotificationPreferencesData = {
        receive_email_notifications: receiveEmailNotifications,
        receive_sms_notifications: receiveSmsNotifications,
      };
      const updatedPreferences =
        await administratorService.updateAdminNotificationPreferences(data);

      if (loggedInUser) {
        updateUserInStore({
          ...loggedInUser,
          receive_email_notifications:
            updatedPreferences.receive_email_notifications,
          receive_sms_notifications:
            updatedPreferences.receive_sms_notifications,
        });
        setReceiveEmailNotifications(updatedPreferences.receive_email_notifications ?? true);
        setReceiveSmsNotifications(updatedPreferences.receive_sms_notifications ?? false);
      }
      toast.success("Preferencias de notificación actualizadas exitosamente.");
    } catch (err: any) {
      console.error("Error updating notification preferences:", err);
      toast.error(
        err.response?.data?.message ||
          "Error al actualizar las preferencias de notificación."
      );
    } finally {
      setIsSaving(false);
    }
  };

  // NUEVO: Manejador para establecer un horario para edición
  const handleEditHorarioClick = useCallback((horario: HorarioDisponible) => {
    setEditingHorario(horario);
    setNewHorarioDiaSemana(String(horario.dia_semana));
    setNewHorarioHoraInicio(horario.hora_inicio);
    setNewHorarioHoraFin(horario.hora_fin);
  }, []);

  // NUEVO: Manejador para cancelar la edición de un horario
  const handleCancelEditHorario = useCallback(() => {
    setEditingHorario(null);
    setNewHorarioDiaSemana("");
    setNewHorarioHoraInicio("");
    setNewHorarioHoraFin("");
  }, []);

  // NUEVO/MODIFICADO: Manejador para añadir o actualizar un horario
  const handleSubmitHorarioForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loggedInUser?.administrador_id) {
      toast.error("Usuario no autenticado.");
      return;
    }
    if (!newHorarioDiaSemana || !newHorarioHoraInicio || !newHorarioHoraFin) {
      toast.error("Por favor, complete todos los campos para el horario.");
      return;
    }

    setIsSavingHorario(true);
    try {
      if (editingHorario) {
        // Actualizar horario existente
        const data: UpdateHorarioDisponibleData = {
          dia_semana: parseInt(newHorarioDiaSemana),
          hora_inicio: newHorarioHoraInicio,
          hora_fin: newHorarioHoraFin,
        };
        await administratorService.updateHorarioDisponible(editingHorario.horario_disponible_id, data);
        toast.success("Horario de trabajo actualizado exitosamente.");
      } else {
        // Crear nuevo horario
        const data: CreateHorarioDisponibleData = {
          administrador_id: loggedInUser.administrador_id,
          dia_semana: parseInt(newHorarioDiaSemana),
          hora_inicio: newHorarioHoraInicio,
          hora_fin: newHorarioHoraFin,
        };
        await administratorService.createHorarioDisponible(data);
        toast.success("Horario de trabajo añadido exitosamente.");
      }
      handleCancelEditHorario(); // Resetear formulario después de éxito
      fetchAvailabilityData(); // Recargar la lista de horarios
    } catch (err: any) {
      console.error("Error al guardar horario:", err);
      toast.error(
        err.response?.data?.message || "Error al guardar el horario."
      );
    } finally {
      setIsSavingHorario(false);
    }
  };

  // Manejador para eliminar un horario
  const handleDeleteHorario = async (horarioId: number) => {
    const confirmed = window.confirm("¿Estás seguro de que quieres eliminar este horario?");
    if (!confirmed) return;

    try {
      await administratorService.deleteHorarioDisponible(horarioId);
      toast.success("Horario eliminado exitosamente.");
      fetchAvailabilityData(); // Recargar la lista de horarios
    } catch (err: any) {
      console.error("Error al eliminar horario:", err);
      toast.error(
        err.response?.data?.message || "Error al eliminar el horario."
      );
    }
  };

  // NUEVO: Manejador para establecer una excepción para edición
  const handleEditExcepcionClick = useCallback((excepcion: ExcepcionDisponibilidad) => {
    setEditingExcepcion(excepcion);
    setNewExcepcionFecha(excepcion.fecha);
    setNewExcepcionEsDiaCompleto(excepcion.es_dia_completo);
    setNewExcepcionHoraInicioBloqueo(excepcion.hora_inicio_bloqueo || "");
    setNewExcepcionHoraFinBloqueo(excepcion.hora_fin_bloqueo || "");
    setNewExcepcionDescripcion(excepcion.descripcion || "");
  }, []);

  // NUEVO: Manejador para cancelar la edición de una excepción
  const handleCancelEditExcepcion = useCallback(() => {
    setEditingExcepcion(null);
    setNewExcepcionFecha("");
    setNewExcepcionEsDiaCompleto(false);
    setNewExcepcionHoraInicioBloqueo("");
    setNewExcepcionHoraFinBloqueo("");
    setNewExcepcionDescripcion("");
  }, []);

  // MODIFICADO: Manejador para añadir o actualizar una excepción (antes handleAddExcepcion)
  const handleSubmitExcepcionForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loggedInUser?.administrador_id) {
      toast.error("Usuario no autenticado.");
      return;
    }
    if (!newExcepcionFecha) {
      toast.error("Por favor, seleccione una fecha para la excepción.");
      return;
    }
    if (!newExcepcionEsDiaCompleto && (!newExcepcionHoraInicioBloqueo || !newExcepcionHoraFinBloqueo)) {
      toast.error("Para excepciones parciales, ingrese la hora de inicio y fin.");
      return;
    }
    setIsSavingExcepcion(true);
    try {
      if (editingExcepcion) {
        // Actualizar excepción existente
        const data: UpdateExcepcionDisponibilidadData = {
          fecha: newExcepcionFecha,
          es_dia_completo: newExcepcionEsDiaCompleto,
          hora_inicio_bloqueo: newExcepcionEsDiaCompleto ? undefined : newExcepcionHoraInicioBloqueo,
          hora_fin_bloqueo: newExcepcionEsDiaCompleto ? undefined : newExcepcionHoraFinBloqueo,
          descripcion: newExcepcionDescripcion || undefined,
        };
        await administratorService.updateExcepcionDisponibilidad(editingExcepcion.excepcion_id, data);
        toast.success("Excepción de disponibilidad actualizada exitosamente.");
      } else {
        // Crear nueva excepción
        const data: CreateExcepcionDisponibilidadData = {
          administrador_id: loggedInUser.administrador_id,
          fecha: newExcepcionFecha,
          es_dia_completo: newExcepcionEsDiaCompleto,
          hora_inicio_bloqueo: newExcepcionEsDiaCompleto ? undefined : newExcepcionHoraInicioBloqueo,
          hora_fin_bloqueo: newExcepcionEsDiaCompleto ? undefined : newExcepcionHoraFinBloqueo,
          descripcion: newExcepcionDescripcion || undefined,
        };
        await administratorService.createExcepcionDisponibilidad(data);
        toast.success("Excepción de disponibilidad añadida exitosamente.");
      }
      handleCancelEditExcepcion(); // Resetear formulario después de éxito
      fetchAvailabilityData(); // Recargar la lista de excepciones
    } catch (err: any) {
      console.error("Error al guardar excepción:", err);
      toast.error(
        err.response?.data?.message || "Error al guardar la excepción."
      );
    } finally {
      setIsSavingExcepcion(false);
    }
  };

  // Manejador para eliminar una excepción
  const handleDeleteExcepcion = async (excepcionId: number) => {
    const confirmed = window.confirm("¿Estás seguro de que quieres eliminar esta excepción?");
    if (!confirmed) return;
    
    try {
      await administratorService.deleteExcepcionDisponibilidad(excepcionId);
      toast.success("Excepción eliminada exitosamente.");
      fetchAvailabilityData(); // Recargar la lista de excepciones
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "Error al eliminar la excepción."
      );
    }
  };

  // Muestra el spinner de carga si el store está cargando el usuario
  if (isLoadingAuth) {
    return (
      <div className="flex justify-center items-center h-full min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
        <p className="ml-2 text-gray-600 dark:text-gray-400">
          Cargando ajustes...
        </p>
      </div>
    );
  }

  // Muestra un mensaje si no hay usuario autenticado después de la carga
  if (!loggedInUser) {
    return (
      <div className="flex flex-col justify-center items-center h-full min-h-[400px] text-red-500">
        <XCircle className="h-8 w-8 mb-2" />
        <p>No se encontró información de usuario. Por favor, inicie sesión.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-4xl">
      <Card className="w-full rounded-lg shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold dark:text-white">
            Ajustes
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">
            Gestiona la configuración de tu cuenta y preferencias.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <Tabs defaultValue="security" className="w-full">
            <TabsList className="grid w-full grid-cols-3 sm:grid-cols-4 gap-2 mb-4 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
              <TabsTrigger value="security" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white rounded-md transition-colors">Seguridad</TabsTrigger>
              <TabsTrigger value="notifications" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white rounded-md transition-colors">Notificaciones</TabsTrigger>
              <TabsTrigger value="availability" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white rounded-md transition-colors">Disponibilidad</TabsTrigger>
              <TabsTrigger value="appearance" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white rounded-md transition-colors">Apariencia</TabsTrigger>
            </TabsList>

            {/* Pestaña Seguridad */}
            <TabsContent value="security" className="pt-4">
              <SecuritySettingsTab
                currentPassword={currentPassword}
                setCurrentPassword={setCurrentPassword}
                newPassword={newPassword}
                setNewPassword={setNewPassword}
                confirmNewPassword={confirmNewPassword}
                setConfirmNewPassword={setConfirmNewPassword}
                passwordError={passwordError}
                isSaving={isSaving}
                handleChangePassword={handleChangePassword}
              />
            </TabsContent>

            {/* Pestaña Notificaciones */}
            <TabsContent value="notifications" className="pt-4">
              <NotificationSettingsTab
                receiveEmailNotifications={receiveEmailNotifications}
                setReceiveEmailNotifications={setReceiveEmailNotifications}
                receiveSmsNotifications={receiveSmsNotifications}
                setReceiveSmsNotifications={setReceiveSmsNotifications}
                isSaving={isSaving}
                handleUpdateNotifications={handleUpdateNotifications}
              />
            </TabsContent>

            {/* Nueva Pestaña Disponibilidad */}
            <TabsContent value="availability" className="pt-4">
              <AvailabilitySettingsTab
                loggedInUser={loggedInUser as Administrador}
                isFetchingAvailability={isFetchingAvailability}
                horarios={horarios}
                excepciones={excepciones}
                dayNames={dayNames}
                newHorarioDiaSemana={newHorarioDiaSemana}
                setNewHorarioDiaSemana={setNewHorarioDiaSemana}
                newHorarioHoraInicio={newHorarioHoraInicio}
                setNewHorarioHoraInicio={setNewHorarioHoraInicio}
                newHorarioHoraFin={newHorarioHoraFin}
                setNewHorarioHoraFin={setNewHorarioHoraFin}
                isSavingHorario={isSavingHorario}
                handleSubmitHorarioForm={handleSubmitHorarioForm}
                handleDeleteHorario={handleDeleteHorario}
                editingHorario={editingHorario}
                handleEditHorarioClick={handleEditHorarioClick}
                handleCancelEditHorario={handleCancelEditHorario}
                newExcepcionFecha={newExcepcionFecha}
                setNewExcepcionFecha={setNewExcepcionFecha}
                newExcepcionEsDiaCompleto={newExcepcionEsDiaCompleto}
                setNewExcepcionEsDiaCompleto={setNewExcepcionEsDiaCompleto}
                newExcepcionHoraInicioBloqueo={newExcepcionHoraInicioBloqueo}
                setNewExcepcionHoraInicioBloqueo={setNewExcepcionHoraInicioBloqueo}
                newExcepcionHoraFinBloqueo={newExcepcionHoraFinBloqueo}
                setNewExcepcionHoraFinBloqueo={setNewExcepcionHoraFinBloqueo}
                newExcepcionDescripcion={newExcepcionDescripcion}
                setNewExcepcionDescripcion={setNewExcepcionDescripcion}
                isSavingExcepcion={isSavingExcepcion}
                handleSubmitExcepcionForm={handleSubmitExcepcionForm}
                handleDeleteExcepcion={handleDeleteExcepcion}
                editingExcepcion={editingExcepcion} // NEW PROP
                handleEditExcepcionClick={handleEditExcepcionClick}
                handleCancelEditExcepcion={handleCancelEditExcepcion}
              />
            </TabsContent>

            {/* Pestaña Apariencia */}
            <TabsContent value="appearance" className="pt-4">
              <AppearanceSettingsTab />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
