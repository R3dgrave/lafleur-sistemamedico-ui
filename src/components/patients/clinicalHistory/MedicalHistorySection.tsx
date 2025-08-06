import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Loader2, PlusIcon, HistoryIcon } from "lucide-react";
import { useClinicalHistory } from "@/hooks/clinicalHistory/useClinicalHistory";
import { useAnamnesis } from "@/hooks/clinicalHistory/useAnamnesis";
import { usePhysicalExamination } from "../../../hooks/clinicalHistory/usePhysicalExamination";
import { useDiagnostico } from "@/hooks/clinicalHistory/useDiagnostico";
import { usePlanTratamiento } from "@/hooks/clinicalHistory/usePlanTratamiento";
import { usePruebasIniciales } from "@/hooks/clinicalHistory/usePruebasIniciales";
import AnamnesisForm from "./AnamnesisForm";
import ExploracionFisicaForm from "./ExploracionFisicaForm";
import DiagnosticoForm from "./DiagnosticoForm";
import PlanTratamientoForm from "./PlanTratamientoForm";
import PruebasInicialesForm from "./PruebasInicialesForm";
import { AnamnesisRecord } from "./AnamnesisRecord";
import { ExploracionFisicaRecord } from "./ExploracionFisicaRecord";
import { DiagnosticoRecord } from "./DiagnosticoRecord";
import { PlanTratamientoRecord } from "./PlanTratamientoRecord";
import { PruebasInicialesRecord } from "./PruebasInicialesRecord";
import { MedicalRecordTab } from "./MedicalRecordTab";
import { MedicalRecordModal } from "./MedicalRecordModal";
import { appointmentService } from "@/services/appointmentService";
import type {
  Anamnesis,
  Cita,
  ExploracionFisica,
  Diagnostico,
  PlanTratamiento,
  PruebasIniciales,
} from "@/types";

interface MedicalHistorySectionProps {
  pacienteId: number;
}

const MedicalHistorySection: React.FC<MedicalHistorySectionProps> = ({
  pacienteId,
}) => {
  const {
    clinicalHistory,
    isLoadingClinicalHistory,
    isErrorClinicalHistory,
    clinicalHistoryError,
    createClinicalHistory,
    isCreatingClinicalHistory,
  } = useClinicalHistory(pacienteId);

  const {
    data: patientAppointments,
    isLoading: isLoadingPatientAppointments,
    isError: isErrorPatientAppointments,
    error: patientAppointmentsError,
  } = useQuery<Cita[], Error>({
    queryKey: ["patientAppointments", pacienteId],
    queryFn: () =>
      appointmentService.getAll({
        paciente_id: pacienteId,
        estado_cita: "Pendiente",
      }),
    enabled: !!pacienteId,
  });

  const {
    anamnesisRecords,
    isLoadingAnamnesis,
    isErrorAnamnesis,
    anamnesisError,
    isAnamnesisFormOpen,
    editingAnamnesis,
    isSavingAnamnesis,
    handleOpenAnamnesisForm,
    handleCloseAnamnesisForm,
    handleSubmitAnamnesisForm,
    handleDeleteAnamnesis,
  } = useAnamnesis(clinicalHistory?.historia_clinica_id);

  const {
    exploracionRecords,
    isLoadingExploracion,
    isErrorExploracion,
    exploracionError,
    isExploracionFormOpen,
    editingExploracion,
    isSavingExploracion,
    handleOpenExploracionForm,
    handleCloseExploracionForm,
    handleSubmitExploracionForm,
    handleDeleteExploracion,
  } = usePhysicalExamination(clinicalHistory?.historia_clinica_id);

  const {
    diagnosticoRecords,
    isLoadingDiagnostico,
    isErrorDiagnostico,
    diagnosticoError,
    isDiagnosticoFormOpen,
    editingDiagnostico,
    isSavingDiagnostico,
    handleOpenDiagnosticoForm,
    handleCloseDiagnosticoForm,
    handleSubmitDiagnosticoForm,
    handleDeleteDiagnostico,
  } = useDiagnostico(clinicalHistory?.historia_clinica_id);

  const {
    planTratamientoRecords,
    isLoadingPlanTratamiento,
    isErrorPlanTratamiento,
    planTratamientoError,
    isPlanTratamientoFormOpen,
    editingPlanTratamiento,
    isSavingPlanTratamiento,
    handleOpenPlanTratamientoForm,
    handleClosePlanTratamientoForm,
    handleSubmitPlanTratamientoForm,
    handleDeletePlanTratamiento,
  } = usePlanTratamiento(clinicalHistory?.historia_clinica_id);

  const {
    pruebasInicialesRecords,
    isLoadingPruebasIniciales,
    isErrorPruebasIniciales,
    pruebasInicialesError,
    isPruebasInicialesFormOpen,
    editingPruebasIniciales,
    isSavingPruebasIniciales,
    handleOpenPruebasInicialesForm,
    handleClosePruebasInicialesForm,
    handleSubmitPruebasInicialesForm,
    handleDeletePruebasIniciales,
  } = usePruebasIniciales(pacienteId);

  if (isLoadingClinicalHistory || isLoadingPatientAppointments) {
    return (
      <Card className="rounded-lg shadow-md p-6 flex justify-center items-center min-h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
        <p className="ml-2 text-gray-600 dark:text-gray-400">
          Cargando historia clínica y citas...
        </p>
      </Card>
    );
  }

  if (
    isErrorClinicalHistory &&
    (clinicalHistoryError as any)?.response?.status !== 404
  ) {
    return (
      <Card className="rounded-lg shadow-md p-6 text-red-500">
        <p>
          Error al cargar la historia clínica: {clinicalHistoryError?.message}
        </p>
      </Card>
    );
  }

  if (isErrorPatientAppointments) {
    return (
      <Card className="rounded-lg shadow-md p-6 text-red-500">
        <p>
          Error al cargar las citas del paciente:{" "}
          {patientAppointmentsError?.message}
        </p>
      </Card>
    );
  }

  if (!clinicalHistory) {
    return (
      <Card className="w-full rounded-lg shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl font-bold dark:text-white">
            Historial Clínico
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">
            Gestiona la información médica del paciente.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="text-center p-8 border rounded-md bg-yellow-50 dark:bg-yellow-900/20">
            <HistoryIcon className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              Historia Clínica no Encontrada
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Parece que este paciente aún no tiene una historia clínica general
              registrada. Puedes crearla ahora para empezar a documentar sus
              antecedentes y consultas.
            </p>
            <Button
              onClick={() => createClinicalHistory(pacienteId)}
              disabled={isCreatingClinicalHistory}
            >
              {isCreatingClinicalHistory ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <PlusIcon className="mr-2 h-4 w-4" />
              )}
              Crear Historia Clínica
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full rounded-lg shadow-lg">
      <CardHeader className="pb-2">
        <CardTitle className="text-2xl font-bold dark:text-white">
          Historial Clínico de ({clinicalHistory.Paciente?.nombre}{" "}
          {clinicalHistory.Paciente?.apellido})
        </CardTitle>
        <CardDescription className="text-gray-600 dark:text-gray-400">
          Creada el:{" "}
          {format(
            new Date(clinicalHistory.fecha_creacion),
            "dd/MM/yyyy HH:mm",
            { locale: es }
          )}{" "}
          | Última Actualización:{" "}
          {format(
            new Date(clinicalHistory.ultima_actualizacion),
            "dd/MM/yyyy HH:mm",
            { locale: es }
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <Tabs defaultValue="anamnesis" className="w-full">
          <TabsList className="grid w-full grid-cols-3 sm:grid-cols-6 gap-2 mb-4 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            <TabsTrigger
              value="summary"
              className="data-[state=active]:bg-blue-500 data-[state=active]:text-white rounded-md transition-colors"
            >
              Resumen
            </TabsTrigger>
            <TabsTrigger
              value="anamnesis"
              className="data-[state=active]:bg-blue-500 data-[state=active]:text-white rounded-md transition-colors"
            >
              Anamnesis
            </TabsTrigger>
            <TabsTrigger
              value="physical-exam"
              className="data-[state=active]:bg-blue-500 data-[state=active]:text-white rounded-md transition-colors"
            >
              Exploración Física
            </TabsTrigger>
            <TabsTrigger
              value="diagnoses"
              className="data-[state=active]:bg-blue-500 data-[state=active]:text-white rounded-md transition-colors"
            >
              Diagnósticos
            </TabsTrigger>
            <TabsTrigger
              value="treatment-plan"
              className="data-[state=active]:bg-blue-500 data-[state=active]:text-white rounded-md transition-colors"
            >
              Plan de Tratamiento
            </TabsTrigger>
            <TabsTrigger
              value="initial-tests"
              className="data-[state=active]:bg-blue-500 data-[state=active]:text-white rounded-md transition-colors"
            >
              Pruebas Iniciales
            </TabsTrigger>
          </TabsList>

          {/* Pestaña Resumen */}
          <TabsContent value="summary" className="pt-4">
            <Card>
              <CardHeader>
                <CardTitle>Resumen General</CardTitle>
                <CardDescription>
                  Información clave y un vistazo rápido al historial del
                  paciente.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <h4 className="font-semibold mb-2">Última Anamnesis:</h4>
                {anamnesisRecords && anamnesisRecords.length > 0 ? (
                  <div className="border p-4 rounded-md bg-gray-50 dark:bg-gray-800">
                    <AnamnesisRecord anamnesis={anamnesisRecords[0]} />
                  </div>
                ) : (
                  <p className="text-gray-500">
                    No hay registros de anamnesis.
                  </p>
                )}
                <Separator className="my-4" />
                <h4 className="font-semibold mb-2">
                  Última Exploración Física:
                </h4>
                {exploracionRecords && exploracionRecords.length > 0 ? (
                  <div className="border p-4 rounded-md bg-gray-50 dark:bg-gray-800">
                    <ExploracionFisicaRecord exploracion={exploracionRecords[0]} />
                  </div>
                ) : (
                  <p className="text-gray-500">
                    No hay registros de exploración física.
                  </p>
                )}
                <Separator className="my-4" />
                <h4 className="font-semibold mb-2">Último Diagnóstico:</h4>
                {diagnosticoRecords && diagnosticoRecords.length > 0 ? (
                  <div className="border p-4 rounded-md bg-gray-50 dark:bg-gray-800">
                    <DiagnosticoRecord diagnostico={diagnosticoRecords[0]} />
                  </div>
                ) : (
                  <p className="text-gray-500">
                    No hay registros de diagnóstico.
                  </p>
                )}
                <Separator className="my-4" />
                <h4 className="font-semibold mb-2">
                  Último Plan de Tratamiento:
                </h4>
                {planTratamientoRecords && planTratamientoRecords.length > 0 ? (
                  <div className="border p-4 rounded-md bg-gray-50 dark:bg-gray-800">
                    <PlanTratamientoRecord plan={planTratamientoRecords[0]} />
                  </div>
                ) : (
                  <p className="text-gray-500">
                    No hay registros de plan de tratamiento.
                  </p>
                )}
                <Separator className="my-4" />
                <h4 className="font-semibold mb-2">
                  Últimas Pruebas Iniciales:
                </h4>
                {pruebasInicialesRecords &&
                pruebasInicialesRecords.length > 0 ? (
                  <div className="border p-4 rounded-md bg-gray-50 dark:bg-gray-800">
                    <PruebasInicialesRecord
                      pruebas={pruebasInicialesRecords[0]}
                    />
                  </div>
                ) : (
                  <p className="text-gray-500">
                    No hay registros de pruebas iniciales.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pestaña Anamnesis (usando el nuevo componente) */}
          <TabsContent value="anamnesis" className="pt-4">
            <MedicalRecordTab
              title="Registros de Anamnesis"
              records={anamnesisRecords}
              isLoading={isLoadingAnamnesis}
              isError={isErrorAnamnesis}
              error={anamnesisError}
              onAdd={() => handleOpenAnamnesisForm()}
              onEdit={(record) => handleOpenAnamnesisForm(record as Anamnesis)}
              onDelete={handleDeleteAnamnesis}
              idKey="anamnesis_id"
              renderItem={(anamnesis) => (
                <AnamnesisRecord anamnesis={anamnesis as Anamnesis} />
              )}
            />
          </TabsContent>

          {/* Pestaña Exploración Física (usando el nuevo componente) */}
          <TabsContent value="physical-exam" className="pt-4">
            <MedicalRecordTab
              title="Registros de Exploración Física"
              records={exploracionRecords}
              isLoading={isLoadingExploracion}
              isError={isErrorExploracion}
              error={exploracionError}
              onAdd={() => handleOpenExploracionForm()}
              onEdit={(record) =>
                handleOpenExploracionForm(record as ExploracionFisica)
              }
              onDelete={handleDeleteExploracion}
              idKey="exploracion_id"
              renderItem={(exploracion) => (
                <ExploracionFisicaRecord
                  exploracion={exploracion as ExploracionFisica}
                />
              )}
            />
          </TabsContent>

          {/* Pestaña Diagnósticos (usando el nuevo componente) */}
          <TabsContent value="diagnoses" className="pt-4">
            <MedicalRecordTab
              title="Registros de Diagnósticos"
              records={diagnosticoRecords}
              isLoading={isLoadingDiagnostico}
              isError={isErrorDiagnostico}
              error={diagnosticoError}
              onAdd={() => handleOpenDiagnosticoForm()}
              onEdit={(record) =>
                handleOpenDiagnosticoForm(record as Diagnostico)
              }
              onDelete={handleDeleteDiagnostico}
              idKey="diagnostico_id"
              renderItem={(diagnostico) => (
                <DiagnosticoRecord diagnostico={diagnostico as Diagnostico} />
              )}
            />
          </TabsContent>

          {/* Pestaña Plan de Tratamiento (usando el nuevo componente) */}
          <TabsContent value="treatment-plan" className="pt-4">
            <MedicalRecordTab
              title="Registros de Plan de Tratamiento"
              records={planTratamientoRecords}
              isLoading={isLoadingPlanTratamiento}
              isError={isErrorPlanTratamiento}
              error={planTratamientoError}
              onAdd={() => handleOpenPlanTratamientoForm()}
              onEdit={(record) =>
                handleOpenPlanTratamientoForm(record as PlanTratamiento)
              }
              onDelete={handleDeletePlanTratamiento}
              idKey="plan_id"
              renderItem={(plan) => (
                <PlanTratamientoRecord plan={plan as PlanTratamiento} />
              )}
            />
          </TabsContent>

          <TabsContent value="initial-tests" className="pt-4">
            <MedicalRecordTab
              title="Pruebas Iniciales (Antropometría y Signos Vitales)"
              records={pruebasInicialesRecords}
              isLoading={isLoadingPruebasIniciales}
              isError={isErrorPruebasIniciales}
              error={pruebasInicialesError}
              onAdd={() => handleOpenPruebasInicialesForm()}
              onEdit={(record) =>
                handleOpenPruebasInicialesForm(record as PruebasIniciales)
              }
              onDelete={handleDeletePruebasIniciales}
              idKey="prueba_id"
              renderItem={(pruebas) => (
                <PruebasInicialesRecord pruebas={pruebas as PruebasIniciales} />
              )}
            />
          </TabsContent>
        </Tabs>
      </CardContent>

      {/* Modales de Formulario (usando el nuevo componente genérico) */}
      <MedicalRecordModal
        title={editingAnamnesis ? "Editar Anamnesis" : "Nueva Anamnesis"}
        isOpen={isAnamnesisFormOpen}
        onClose={handleCloseAnamnesisForm}
      >
        <AnamnesisForm
          initialData={editingAnamnesis}
          onSubmit={handleSubmitAnamnesisForm}
          onCancel={handleCloseAnamnesisForm}
          isSubmitting={isSavingAnamnesis}
          patientAppointments={patientAppointments || []}
        />
      </MedicalRecordModal>

      <MedicalRecordModal
        title={
          editingExploracion
            ? "Editar Exploración Física"
            : "Nueva Exploración Física"
        }
        isOpen={isExploracionFormOpen}
        onClose={handleCloseExploracionForm}
      >
        <ExploracionFisicaForm
          initialData={editingExploracion}
          onSubmit={handleSubmitExploracionForm}
          onCancel={handleCloseExploracionForm}
          isSubmitting={isSavingExploracion}
          patientAppointments={patientAppointments || []}
        />
      </MedicalRecordModal>

      <MedicalRecordModal
        title={editingDiagnostico ? "Editar Diagnóstico" : "Nuevo Diagnóstico"}
        isOpen={isDiagnosticoFormOpen}
        onClose={handleCloseDiagnosticoForm}
      >
        <DiagnosticoForm
          initialData={editingDiagnostico}
          onSubmit={handleSubmitDiagnosticoForm}
          onCancel={handleCloseDiagnosticoForm}
          isSubmitting={isSavingDiagnostico}
          patientAppointments={patientAppointments || []}
        />
      </MedicalRecordModal>

      <MedicalRecordModal
        title={
          editingPlanTratamiento
            ? "Editar Plan de Tratamiento"
            : "Nuevo Plan de Tratamiento"
        }
        isOpen={isPlanTratamientoFormOpen}
        onClose={handleClosePlanTratamientoForm}
      >
        <PlanTratamientoForm
          initialData={editingPlanTratamiento}
          onSubmit={handleSubmitPlanTratamientoForm}
          onCancel={handleClosePlanTratamientoForm}
          isSubmitting={isSavingPlanTratamiento}
          patientAppointments={patientAppointments || []}
        />
      </MedicalRecordModal>

      <MedicalRecordModal
        title={
          editingPruebasIniciales
            ? "Editar Pruebas Iniciales"
            : "Nuevas Pruebas Iniciales"
        }
        isOpen={isPruebasInicialesFormOpen}
        onClose={handleClosePruebasInicialesForm}
      >
        <PruebasInicialesForm
          initialData={editingPruebasIniciales}
          onSubmit={handleSubmitPruebasInicialesForm}
          onCancel={handleClosePruebasInicialesForm}
          isSubmitting={isSavingPruebasIniciales}
          patientAppointments={patientAppointments || []}
        />
      </MedicalRecordModal>
    </Card>
  );
};

export default MedicalHistorySection;