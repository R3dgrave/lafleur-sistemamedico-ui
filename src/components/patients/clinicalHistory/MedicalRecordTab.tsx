import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EditIcon, Loader2, PlusIcon, Trash2Icon } from "lucide-react";
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

export const MedicalRecordTab: React.FC<{
  title: string;
  records: any[] | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  onAdd: () => void;
  onEdit: (record: any) => void;
  onDelete: (id: number) => void;
  idKey: string;
  renderItem: (record: any) => React.ReactNode;
}> = ({
  title,
  records,
  isLoading,
  isError,
  error,
  onAdd,
  onEdit,
  onDelete,
  idKey,
  renderItem,
}) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-xl">{title}</CardTitle>
      <Button size="sm" onClick={onAdd}>
        <PlusIcon className="mr-2 h-4 w-4" /> Nuevo
      </Button>
    </CardHeader>
    <CardContent>
      {isLoading ? (
        <div className="flex justify-center items-center py-4">
          <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
          <p className="ml-2 text-gray-600 dark:text-gray-400">
            Cargando {title.toLowerCase()}...
          </p>
        </div>
      ) : isError ? (
        <p className="text-red-500">
          Error al cargar {title.toLowerCase()}: {error?.message}
        </p>
      ) : records && records.length > 0 ? (
        <div className="space-y-4">
          {records.map((record) => (
            <Card key={record[idKey]} className="p-4">
              <div className="flex justify-between items-start mb-2">
                {renderItem(record)}
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => onEdit(record)}
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
                          permanentemente el registro.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => onDelete(record[idKey])}
                        >
                          Eliminar
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500">
          No hay registros de {title.toLowerCase()} para esta historia clínica.
        </p>
      )}
    </CardContent>
  </Card>
);