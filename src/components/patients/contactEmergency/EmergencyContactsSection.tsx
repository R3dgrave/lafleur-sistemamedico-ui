// src/components/patients/EmergencyContactsSection.tsx
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { EditIcon, PlusIcon, Trash2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { emergencyContactService } from "@/services/emergencyContactService";
import type {
  ContactoEmergencia,
  CreateContactoEmergenciaFormValues,
  UpdateContactoEmergenciaFormValues,
} from "../../../types/index";
import EmergencyContactForm from "./EmergencyContactForm";

interface EmergencyContactsSectionProps {
  pacienteId: number;
  patientName: string;
  patientRut: string;
}

const EmergencyContactsSection: React.FC<EmergencyContactsSectionProps> = ({
  pacienteId,
  patientName,
  patientRut,
}) => {
  const queryClient = useQueryClient();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingContact, setEditingContact] =
    useState<ContactoEmergencia | null>(null);

  const {
    data: contacts,
    isLoading,
    isError,
    error,
  } = useQuery<ContactoEmergencia[], Error>({
    queryKey: ["emergencyContacts", pacienteId],
    queryFn: () => emergencyContactService.getAll(pacienteId),
  });

  const createMutation = useMutation<
    ContactoEmergencia,
    Error,
    CreateContactoEmergenciaFormValues
  >({
    mutationFn: (data) =>
      emergencyContactService.create({ ...data, paciente_id: pacienteId }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["emergencyContacts", pacienteId],
      });
      toast.success("Contacto de emergencia creado exitosamente.");
      setIsCreateModalOpen(false);
    },
    onError: (err) => toast.error(`Error al crear contacto: ${err.message}`),
  });

  const updateMutation = useMutation<
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
    onError: (err) =>
      toast.error(`Error al actualizar contacto: ${err.message}`),
  });

  const deleteMutation = useMutation<any, Error, number>({
    mutationFn: emergencyContactService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["emergencyContacts", pacienteId],
      });
      toast.success("Contacto de emergencia eliminado exitosamente.");
    },
    onError: (err) => toast.error(`Error al eliminar contacto: ${err.message}`),
  });

  const handleSubmit = (
    data:
      | CreateContactoEmergenciaFormValues
      | UpdateContactoEmergenciaFormValues
  ) => {
    if (editingContact) {
      updateMutation.mutate({
        id: editingContact.contacto_emergencia_id,
        data: data as UpdateContactoEmergenciaFormValues,
      });
    } else {
      createMutation.mutate(data as CreateContactoEmergenciaFormValues);
    }
  };

  if (isLoading) return <div>Cargando contactos...</div>;
  if (isError)
    return (
      <div className="text-red-500">
        Error al cargar contactos: {error.message}
      </div>
    );

  return (
    <Card className="w-full lg:w-2/4">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl">Contactos de Emergencia</CardTitle>
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <PlusIcon className="mr-2 h-4 w-4" /> Añadir Contacto
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Añadir Contacto de Emergencia</DialogTitle>
              <DialogDescription>
                Completa los datos para añadir un nuevo contacto para{" "}
                {patientName}.
              </DialogDescription>
            </DialogHeader>
            <EmergencyContactForm
              onSubmit={handleSubmit}
              isSubmitting={createMutation.isPending}
              onCancel={() => setIsCreateModalOpen(false)}
              pacienteRut={`${patientRut}`}
            />
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {contacts && contacts.length > 0 ? (
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
                {contacts.map((contact) => (
                  <TableRow key={contact.contacto_emergencia_id}>
                    <TableCell className="font-medium">
                      {contact.nombre_contacto}
                    </TableCell>
                    <TableCell>{contact.telefono_contacto}</TableCell>
                    <TableCell>{contact.relacion_paciente || "N/A"}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setEditingContact(contact)}
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
                                Esta acción no se puede deshacer. Esto eliminará
                                permanentemente el contacto de emergencia.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() =>
                                  deleteMutation.mutate(
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
            No hay contactos de emergencia registrados.
          </p>
        )}
        {editingContact && (
          <Dialog
            open={!!editingContact}
            onOpenChange={() => setEditingContact(null)}
          >
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Editar Contacto de Emergencia</DialogTitle>
                <DialogDescription>
                  Modifica los datos del contacto de emergencia.
                </DialogDescription>
              </DialogHeader>
              <EmergencyContactForm
                initialData={editingContact}
                onSubmit={handleSubmit}
                isSubmitting={updateMutation.isPending}
                onCancel={() => setEditingContact(null)}
                pacienteRut={patientRut}
              />
            </DialogContent>
          </Dialog>
        )}
      </CardContent>
    </Card>
  );
};

export default EmergencyContactsSection;
