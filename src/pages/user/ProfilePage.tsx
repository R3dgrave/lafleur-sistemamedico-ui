import React, { useState, useEffect, useRef } from "react";
import { administratorService } from "@/services/administratorService";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Loader2,
  Edit,
  Save,
  XCircle,
  UploadCloud,
} from "lucide-react";
import { toast } from "react-toastify";
import useAuthStore from "@/store/authStore"; // Importa el store de Zustand
import type { UpdateProfileData } from "@/types";

export default function ProfilePage() {
  // Obtiene el estado del usuario y la función de actualización del store
  const {
    user: loggedInUser,
    isLoading: isLoadingAuth,
    updateUserInStore,
  } = useAuthStore();

  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<UpdateProfileData>({});
  const [isSaving, setIsSaving] = useState(false);

  // Nuevos estados para la carga de archivos
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null); // Referencia para el input de archivo oculto

  // Efecto para inicializar formData y filePreviewUrl cuando loggedInUser cambia desde el store
  useEffect(() => {
    if (loggedInUser) {
      setFormData({
        nombre: loggedInUser.nombre,
        apellido: loggedInUser.apellido,
        email: loggedInUser.email,
        profilePictureUrl: loggedInUser.profilePictureUrl,
      });
      setFilePreviewUrl(loggedInUser.profilePictureUrl || null); // Inicializa la previsualización con la URL existente
      setError(null); // Limpia errores si el usuario se carga correctamente
    } else if (!isLoadingAuth) {
      // Si no hay usuario y ya no está cargando la autenticación, significa que no hay sesión
      setError(
        "No se encontró información de usuario. Por favor, inicie sesión."
      );
    }
  }, [loggedInUser, isLoadingAuth]); // Depende de loggedInUser y isLoadingAuth del store

  // Manejador de cambios en los inputs del formulario (para nombre, apellido, email)
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  // Manejadores para la carga de archivos
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setFilePreviewUrl(URL.createObjectURL(file)); // Crea una URL para previsualizar la imagen
    } else {
      setSelectedFile(null);
      // Si no se selecciona un archivo, la previsualización vuelve a la URL actual del usuario
      setFilePreviewUrl(loggedInUser?.profilePictureUrl || null);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault(); // Permite el drop
    e.stopPropagation();
    e.currentTarget.classList.add("border-blue-500", "ring-2", "ring-blue-500"); // Efecto visual al arrastrar
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove(
      "border-blue-500",
      "ring-2",
      "ring-blue-500"
    );
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove(
      "border-blue-500",
      "ring-2",
      "ring-blue-500"
    );

    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      // Asegura que sea una imagen
      setSelectedFile(file);
      setFilePreviewUrl(URL.createObjectURL(file));
    } else {
      toast.error("Por favor, suelta un archivo de imagen válido.");
    }
  };

  // Manejador para guardar los cambios del perfil
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      if (!loggedInUser) {
        toast.error("No hay usuario autenticado para actualizar.");
        setIsSaving(false);
        return;
      }

      const updatedFields: UpdateProfileData = {};
      let fileToUpload: File | null = null;

      if (formData.nombre !== loggedInUser.nombre)
        updatedFields.nombre = formData.nombre;
      if (formData.apellido !== loggedInUser.apellido)
        updatedFields.apellido = formData.apellido;
      if (formData.email !== loggedInUser.email)
        updatedFields.email = formData.email;

      // Lógica para la imagen de perfil
      if (selectedFile) {
        fileToUpload = selectedFile;
      } else if (
        // Si el usuario borró la imagen (no hay archivo seleccionado y la URL de preview está vacía)
        // Y si antes había una imagen de perfil, significa que quiere borrarla.
        filePreviewUrl === "" &&
        loggedInUser.profilePictureUrl
      ) {
        updatedFields.profilePictureUrl = null; // Envía null para indicar que se debe borrar
      }
      // Si no hay `selectedFile` y `filePreviewUrl` no es `""`,
      // significa que la URL no cambió o el usuario no hizo nada,
      // por lo que no se envía `profilePictureUrl` en `updatedFields`
      // y el backend mantendrá la URL existente.

      if (Object.keys(updatedFields).length > 0 || fileToUpload) {
        const updatedUser = await administratorService.updateAdminProfile(
          updatedFields,
          fileToUpload
        );
        updateUserInStore(updatedUser); // Actualiza el usuario en el store centralizado
        setIsEditing(false);
        setSelectedFile(null); // Limpia el archivo seleccionado después de guardar
        // La previsualización se actualizará automáticamente por el useEffect
        toast.success("Perfil actualizado exitosamente.");
      } else {
        toast.info("No hay cambios para guardar.");
        setIsEditing(false);
      }
    } catch (err: any) {
      console.error("Error updating profile:", err);
      setError(err.response?.data?.message || "Error al actualizar el perfil.");
      toast.error(
        err.response?.data?.message || "Error al actualizar el perfil."
      );
    } finally {
      setIsSaving(false);
    }
  };

  // Manejador para cancelar la edición
  const handleCancelEdit = () => {
    setIsEditing(false);
    if (loggedInUser) {
      setFormData({
        nombre: loggedInUser.nombre,
        apellido: loggedInUser.apellido,
        email: loggedInUser.email,
        profilePictureUrl: loggedInUser.profilePictureUrl,
      });
      setFilePreviewUrl(loggedInUser.profilePictureUrl || null); // Restablece la previsualización a la URL original
      setSelectedFile(null); // Limpia el archivo seleccionado
    }
  };

  if (isLoadingAuth) {
    return (
      <div className="flex justify-center items-center h-full min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
        <p className="ml-2 text-gray-600 dark:text-gray-400">
          Cargando perfil...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-full min-h-[400px] text-red-500">
        <XCircle className="h-8 w-8 mb-2" />
        <p>{error}</p>
        <Button onClick={() => window.location.reload()} className="mt-4">
          Recargar Página
        </Button>
      </div>
    );
  }

  if (!loggedInUser) {
    return (
      <div className="flex justify-center items-center h-full min-h-[400px] text-gray-600 dark:text-gray-400">
        <p>No se encontró información de usuario. Por favor, inicie sesión.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-2xl">
      <Card className="w-full">
        <CardHeader className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6 pb-6 border-b dark:border-gray-700">
          <Avatar className="h-24 w-24 sm:h-28 sm:w-28 border-2 border-gray-300 dark:border-gray-600 shadow-md">
            <AvatarImage
              src={
                filePreviewUrl ||
                "https://placehold.co/120x120/cccccc/333333?text=User"
              }
              alt="Foto de perfil"
            />
            <AvatarFallback className="text-xl font-bold bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
              {isEditing
                ? (formData.nombre ? formData.nombre.charAt(0) : "") +
                  (formData.apellido ? formData.apellido.charAt(0) : "")
                : (loggedInUser.nombre ? loggedInUser.nombre.charAt(0) : "") +
                  (loggedInUser.apellido
                    ? loggedInUser.apellido.charAt(0)
                    : "")}
            </AvatarFallback>
          </Avatar>
          <div className="text-center sm:text-left w-full">
            <CardTitle className="text-2xl sm:text-3xl text-gray-900 dark:text-white mb-2">
              {isEditing ? (
                <>
                  <div className="pb-2 space-y-2">
                    <Label
                      htmlFor="nombre"
                      className="text-sm font-medium text-gray-500 dark:text-gray-300"
                    >
                      Nombres:
                    </Label>
                    <Input
                      id="apellido"
                      value={formData.nombre || ""}
                      onChange={handleInputChange}
                      placeholder="Tus nombres"
                      className="text-2xl sm:text-3xl text-gray-500 dark:text-white bg-background border-input focus-visible:ring-ring focus-visible:ring-offset-background focus-visible:ring-2 p-2 h-auto"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="apellido"
                      className="text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Apellidos:
                    </Label>
                    <Input
                      id="nombre"
                      value={formData.apellido || ""}
                      onChange={handleInputChange}
                      placeholder="Tus Apellidos"
                      className="text-2xl sm:text-3xl text-gray-500 dark:text-white bg-background border-input focus-visible:ring-ring focus-visible:ring-offset-background focus-visible:ring-2 p-2 h-auto"
                    />
                  </div>
                </>
              ) : (
                `${loggedInUser.nombre} ${loggedInUser.apellido}`
              )}
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400 mt-1">
              {isEditing ? (
                <div className="space-y-2">
                  <Label
                    htmlFor="email"
                    className="text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Correo Electrónico:
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email || ""}
                    onChange={handleInputChange}
                    placeholder="tu@ejemplo.com"
                    className="text-base text-gray-600 dark:text-gray-400 bg-background border-input focus-visible:ring-ring focus-visible:ring-offset-background focus-visible:ring-2 p-2 h-auto"
                  />
                </div>
              ) : (
                loggedInUser.email
              )}
            </CardDescription>
            <p className="text-blue-600 dark:text-blue-400 text-sm font-semibold uppercase mt-2">
              Rol: {loggedInUser.role}
            </p>
            {isEditing && (
              <div className="mt-4 w-full">
                <Label
                  htmlFor="file-upload"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block"
                >
                  Cargar Foto de Perfil:
                </Label>
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-md cursor-pointer hover:border-blue-500 hover:ring-2 hover:ring-blue-500 transition-all duration-200 ease-in-out"
                >
                  <input
                    id="file-upload"
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <UploadCloud className="h-10 w-10 text-gray-400 dark:text-gray-500 mb-2" />
                  <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                    Arrastra y suelta una imagen aquí, o haz clic para
                    seleccionar
                  </p>
                  {selectedFile && (
                    <p className="mt-2 text-xs text-green-600 dark:text-green-400">
                      Archivo seleccionado: {selectedFile.name}
                    </p>
                  )}
                  {!selectedFile && filePreviewUrl && (
                    <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                      Imagen actual:{" "}
                      {filePreviewUrl.substring(
                        filePreviewUrl.lastIndexOf("/") + 1,
                        filePreviewUrl.indexOf("?") !== -1
                          ? filePreviewUrl.indexOf("?")
                          : filePreviewUrl.length
                      ) || "URL"}
                    </p>
                  )}
                  {!selectedFile && !filePreviewUrl && (
                    <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                      No hay imagen de perfil.
                    </p>
                  )}
                  {/* Botón para eliminar la imagen de perfil */}
                  {filePreviewUrl && !selectedFile && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-2 text-red-500 hover:text-red-700"
                      onClick={(e) => {
                        e.stopPropagation(); // Evita que se dispare el click del div padre
                        setFilePreviewUrl(""); // Establece la URL de preview a vacío para indicar eliminación
                        setSelectedFile(null); // Asegura que no haya un archivo seleccionado
                        toast.info(
                          "Imagen marcada para eliminación al guardar."
                        );
                      }}
                    >
                      <XCircle className="h-4 w-4 mr-1" /> Eliminar imagen
                      actual
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-end dark:border-gray-700">
            {isEditing ? (
              <>
                <Button
                  variant="outline"
                  onClick={handleCancelEdit}
                  className="mr-2"
                >
                  Cancelar
                </Button>
                <Button onClick={handleSaveProfile} disabled={isSaving}>
                  {isSaving ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Guardar Cambios
                </Button>
              </>
            ) : (
              <Button
                onClick={() => setIsEditing(true)}
                className="flex items-center space-x-2"
              >
                <Edit className="h-4 w-4" />
                <span>Editar Perfil</span>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
