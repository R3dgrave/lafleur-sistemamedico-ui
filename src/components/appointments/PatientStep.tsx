import React from "react";
import type { UseFormReturn } from "react-hook-form";
import { SearchIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
  FormField,
} from "@/components/ui/form";
import type {
  Paciente,
  CreateCitaFormValues,
  UpdateCitaFormValues,
} from "@/types";

interface PatientStepProps {
  form: UseFormReturn<CreateCitaFormValues | UpdateCitaFormValues>;
  patientSearchQuery: string;
  selectedPatientInForm: Paciente | null | undefined;
  searchedPatients: Paciente[] | undefined;
  isLoadingSearchedPatients: boolean;
  isFetchingSearchedPatients: boolean;
  handlePatientSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handlePatientSelectFromSearch: (patient: Paciente) => void;
  handleClearSelectedPatient: () => void;
  isPatientSearchDisabled: boolean;
  isSubmitting: boolean;
}

const PatientStep: React.FC<PatientStepProps> = ({
  form,
  patientSearchQuery,
  selectedPatientInForm,
  searchedPatients,
  isLoadingSearchedPatients,
  isFetchingSearchedPatients,
  handlePatientSearchChange,
  handlePatientSelectFromSearch,
  handleClearSelectedPatient,
  isPatientSearchDisabled,
  isSubmitting,
}) => {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">1. Seleccionar Paciente</h2>
      <FormField
        control={form.control}
        name="paciente_id"
        render={({ }) => (
          <FormItem>
            <FormLabel>Paciente</FormLabel>
            <FormControl>
              <div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <SearchIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input
                    id="patient-search"
                    placeholder="Buscar paciente por nombre, apellido o RUT"
                    value={patientSearchQuery}
                    onChange={handlePatientSearchChange}
                    className="pl-10"
                    disabled={isPatientSearchDisabled}
                  />
                  {isLoadingSearchedPatients &&
                    patientSearchQuery.length >= 3 && (
                      <p className="text-sm text-gray-500 mt-1">
                        Buscando pacientes...
                      </p>
                    )}
                  {isFetchingSearchedPatients &&
                    patientSearchQuery.length >= 3 && (
                      <p className="text-sm text-gray-500 mt-1">
                        Buscando pacientes...
                      </p>
                    )}
                </div>
                {selectedPatientInForm && (
                  <div className="p-3 bg-blue-50 border border-blue-200 dark:bg-gray-900 dark:border-gray-700 rounded-md mt-2 flex flex-col items-start justify-between">
                    <div className="pb-2">
                      <p className="font-semibold">
                        {selectedPatientInForm.nombre}{" "}
                        {selectedPatientInForm.apellido}
                      </p>
                      <p className="text-sm">
                        RUT: {selectedPatientInForm.rut}
                      </p>
                      <p className="text-sm">
                        Email: {selectedPatientInForm.email}
                      </p>
                    </div>
                    <Button
                      variant="link"
                      size="sm"
                      onClick={handleClearSelectedPatient}
                      disabled={isSubmitting}
                      className="p-0 h-auto mt-1"
                    >
                      Cambiar paciente
                    </Button>
                  </div>
                )}
                {!selectedPatientInForm &&
                  searchedPatients &&
                  searchedPatients.length > 0 &&
                  patientSearchQuery.length >= 3 && (
                    <div className="border rounded-md max-h-48 overflow-y-auto mt-2">
                      {searchedPatients.map((patient) => (
                        <div
                          key={patient.paciente_id}
                          className="p-2 cursor-pointer hover:bg-gray-100 border-b last:border-b-0 dark:hover:bg-gray-900"
                          onClick={() => handlePatientSelectFromSearch(patient)}
                        >
                          <p className="font-medium">
                            {patient.nombre} {patient.apellido}
                          </p>
                          <p className="text-sm text-gray-600">
                            RUT: {patient.rut}
                          </p>
                          <p className="text-sm text-gray-600">
                            Email: {patient.email}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                {!selectedPatientInForm &&
                  !isLoadingSearchedPatients &&
                  patientSearchQuery.length >= 3 &&
                  searchedPatients?.length === 0 && (
                    <p className="text-sm text-red-500 mt-2">
                      No se encontraron pacientes con este criterio de búsqueda.
                    </p>
                  )}
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default PatientStep;
