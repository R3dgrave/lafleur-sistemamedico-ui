import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";

interface FormNavigationProps {
  step: number;
  setStep: React.Dispatch<React.SetStateAction<number>>;
  canGoNext: () => boolean;
  isSubmitting: boolean;
  isEditing: boolean;
  onCancel: () => void;
  onSubmit: () => void; // This will be form.handleSubmit(onSubmit) from parent
}

const FormNavigation: React.FC<FormNavigationProps> = ({
  step,
  setStep,
  canGoNext,
  isSubmitting,
  isEditing,
  onCancel,
  onSubmit,
}) => {
  return (
    <div className="flex justify-between p-6 pt-0">
      {isEditing ? (
        <>
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Guardando cambios..." : "Guardar Cambios"}
          </Button>
        </>
      ) : (
        <>
          {step > 1 && (
            <Button
              type="button"
              variant="outline"
              onClick={() => setStep(step - 1)}
              disabled={isSubmitting}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Atrás
            </Button>
          )}
          {step < 4 && (
            <Button
              type="button"
              onClick={() => setStep(step + 1)}
              disabled={!canGoNext() || isSubmitting}
              className="ml-auto"
            >
              Siguiente
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
          {step === 4 && (
            <Button
              type="submit"
              onClick={onSubmit} // This will trigger the form's handleSubmit
              disabled={!canGoNext() || isSubmitting}
              className="ml-auto"
            >
              {isSubmitting ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Agendando...
                </>
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Confirmar Cita
                </>
              )}
            </Button>
          )}
        </>
      )}
    </div>
  );
};

export default FormNavigation;
