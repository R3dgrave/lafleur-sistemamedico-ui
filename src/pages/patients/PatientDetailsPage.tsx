// src/pages/patients/PatientDetailsPage.tsx
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ArrowLeftIcon, EditIcon, PlusIcon, Trash2Icon } from "lucide-react";
import { patientService } from "@/services/patientService";
import { emergencyContactService } from "@/services/emergencyContactService";
import type {
  Paciente,
  ContactoEmergencia,
  CreateContactoEmergenciaFormValues,
  UpdateContactoEmergenciaFormValues,
} from "../../types/index";
import EmergencyContactForm from "@/components/patientsForms/EmergencyContactForm";

const PatientDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const pacienteId = id ? parseInt(id) : undefined;
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [isContactCreateModalOpen, setIsContactCreateModalOpen] =
    useState(false);
  const [editingContact, setEditingContact] =
    useState<ContactoEmergencia | null>(null);

  const {
    data: patient,
    isLoading: isPatientLoading,
    isError: isPatientError,
    error: patientError,
  } = useQuery<Paciente, Error>({
    queryKey: ["patient", pacienteId],
    queryFn: () => patientService.getById(pacienteId!),
    enabled: !!pacienteId,
  });

  const {
    data: emergencyContacts,
    isLoading: isContactsLoading,
    isError: isContactsError,
    error: contactsError,
  } = useQuery<ContactoEmergencia[], Error>({
    queryKey: ["emergencyContacts", pacienteId],
    queryFn: () => emergencyContactService.getAll(pacienteId!),
    enabled: !!pacienteId,
  });

  const createContactMutation = useMutation<
    ContactoEmergencia,
    Error,
    CreateContactoEmergenciaFormValues
  >({
    mutationFn: emergencyContactService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["emergencyContacts", pacienteId],
      });
      toast.success("Contacto de emergencia creado exitosamente.");
      setIsContactCreateModalOpen(false);
    },
    onError: (err) => {
      console.error("Error al crear contacto:", err);
      toast.error(`Error al crear contacto: ${err.message}`);
    },
  });

  const updateContactMutation = useMutation<
    ContactoEmergencia,
    Error,
    { id: number; data: UpdateContactoEmergenciaFormValues }
  >({
    mutationFn: ({ id, data }) => emergencyContactService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["emergencyContacts", pacienteId],
      });
      toast.success("Contacto de emergencia actualizado exitosamente.");
      setEditingContact(null);
    },
    onError: (err) => {
      console.error("Error al actualizar contacto:", err);
      toast.error(`Error al actualizar contacto: ${err.message}`);
    },
  });

  const deleteContactMutation = useMutation<any, Error, number>({
    mutationFn: emergencyContactService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["emergencyContacts", pacienteId],
      });
      toast.success("Contacto de emergencia eliminado exitosamente.");
    },
    onError: (err) => {
      console.error("Error al eliminar contacto:", err);
      toast.error(`Error al eliminar contacto: ${err.message}`);
    },
  });

  const handleCreateContact = (
    data:
      | CreateContactoEmergenciaFormValues
      | UpdateContactoEmergenciaFormValues
  ) => {
    createContactMutation.mutate(data as CreateContactoEmergenciaFormValues);
  };

  const handleUpdateContact = (
    data:
      | CreateContactoEmergenciaFormValues
      | UpdateContactoEmergenciaFormValues
  ) => {
    if (editingContact) {
      updateContactMutation.mutate({
        id: editingContact.contacto_emergencia_id,
        data: data as UpdateContactoEmergenciaFormValues,
      });
    }
  };

  const handleDeleteContact = (contactId: number) => {
    deleteContactMutation.mutate(contactId);
  };

  const handleEditContactClick = (contact: ContactoEmergencia) => {
    setEditingContact(contact);
  };

  if (isPatientLoading || isContactsLoading)
    return (
      <div className="flex min-h-screen items-center justify-center text-xl">
        Cargando detalles del paciente...
      </div>
    );
  if (isPatientError)
    return (
      <div className="flex min-h-screen items-center justify-center text-xl text-red-500">
        Error al cargar paciente: {patientError.message}
      </div>
    );
  if (isContactsError)
    return (
      <div className="flex min-h-screen items-center justify-center text-xl text-red-500">
        Error al cargar contactos: {contactsError.message}
      </div>
    );
  if (!patient)
    return (
      <div className="flex min-h-screen items-center justify-center text-xl text-gray-500">
        Paciente no encontrado.
      </div>
    );

  return (
    <div className="container mx-auto p-4">
      <Button
        variant="outline"
        onClick={() => navigate("/pacientes")}
        className="mb-6"
      >
        <ArrowLeftIcon className="mr-2 h-4 w-4" /> Volver a Pacientes
      </Button>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-2xl">
            Detalles del Paciente: {patient.nombre} {patient.apellido}
          </CardTitle>
          <CardDescription>Información completa del paciente.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <p>
            <strong>RUT:</strong> {patient.rut || "N/A"}
          </p>
          <p>
            <strong>Email:</strong> {patient.email}
          </p>
          <p>
            <strong>Teléfono:</strong> {patient.telefono || "N/A"}
          </p>
          <p>
            <strong>Fecha de Nacimiento:</strong>{" "}
            {format(new Date(patient.fecha_nacimiento), "dd/MM/yyyy")}
          </p>
          <p>
            <strong>Género:</strong> {patient.genero}
          </p>
          <p>
            <strong>Identidad de Género:</strong>{" "}
            {patient.identidad_genero || "N/A"}
          </p>
          <p>
            <strong>Sexo Registral:</strong> {patient.sexo_registral || "N/A"}
          </p>
          <p className="md:col-span-2">
            <strong>Dirección:</strong> {patient.direccion || "N/A"}
          </p>
          <p className="md:col-span-2 text-sm text-gray-500">
            Registrado el:{" "}
            {format(new Date(patient.fecha_registro), "dd/MM/yyyy HH:mm")}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xl">Contactos de Emergencia</CardTitle>
          <Dialog
            open={isContactCreateModalOpen}
            onOpenChange={setIsContactCreateModalOpen}
          >
            <DialogTrigger asChild>
              <Button size="sm">
                <PlusIcon className="mr-2 h-4 w-4" /> Añadir Contacto
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Añadir Contacto de Emergencia</DialogTitle>
                <DialogDescription>
                  Completa los datos para añadir un nuevo contacto de emergencia
                  para {patient.nombre}.
                </DialogDescription>
              </DialogHeader>
              <EmergencyContactForm
                pacienteRut={patient.rut || ""}
                onSubmit={handleCreateContact}
                isSubmitting={createContactMutation.isPending}
                onCancel={() => setIsContactCreateModalOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {emergencyContacts && emergencyContacts.length > 0 ? (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Teléfono</TableHead>
                    <TableHead>Relación</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {emergencyContacts.map((contact) => (
                    <TableRow key={contact.contacto_emergencia_id}>
                      <TableCell className="font-medium">
                        {contact.nombre_contacto}
                      </TableCell>
                      <TableCell>{contact.telefono_contacto}</TableCell>
                      <TableCell>
                        {contact.relacion_paciente || "N/A"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleEditContactClick(contact)}
                          >
                            <EditIcon className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="destructive" size="icon">
                                <Trash2Icon className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  ¿Estás absolutamente seguro?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Esta acción no se puede deshacer. Esto
                                  eliminará permanentemente el contacto de
                                  emergencia.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() =>
                                    handleDeleteContact(
                                      contact.contacto_emergencia_id
                                    )
                                  }
                                >
                                  Eliminar
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="text-center text-gray-500">
              No hay contactos de emergencia registrados para este paciente.
            </p>
          )}

          {/* Modal de Edición de Contacto */}
          {editingContact && (
            <Dialog
              open={!!editingContact}
              onOpenChange={() => setEditingContact(null)}
            >
              <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Editar Contacto de Emergencia</DialogTitle>
                  <DialogDescription>
                    Modifica los datos del contacto de emergencia.
                  </DialogDescription>
                </DialogHeader>
                <EmergencyContactForm
                  initialData={editingContact}
                  onSubmit={handleUpdateContact}
                  isSubmitting={updateContactMutation.isPending}
                  onCancel={() => setEditingContact(null)}
                />
              </DialogContent>
            </Dialog>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PatientDetailsPage;
