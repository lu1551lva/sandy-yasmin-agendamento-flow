
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface AppointmentStepsProps {
  currentStep: number;
}

const steps = [
  { id: 1, title: "Serviço" },
  { id: 2, title: "Data e Hora" },
  { id: 3, title: "Seus Dados" },
  { id: 4, title: "Confirmação" },
];

const AppointmentSteps = ({ currentStep }: AppointmentStepsProps) => {
  return (
    <div className="w-full">
      <div className="hidden sm:flex justify-between">
        {steps.map((step) => (
          <div
            key={step.id}
            className={cn(
              "flex flex-col items-center",
              step.id < currentStep && "text-primary",
              step.id === currentStep && "text-primary font-medium"
            )}
          >
            <div
              className={cn(
                "w-8 h-8 rounded-full border flex items-center justify-center mb-2",
                step.id < currentStep
                  ? "bg-primary border-primary text-white"
                  : step.id === currentStep
                  ? "border-primary text-primary"
                  : "border-gray-300 text-gray-400"
              )}
            >
              {step.id < currentStep ? (
                <Check className="h-4 w-4" />
              ) : (
                <span>{step.id}</span>
              )}
            </div>
            <span
              className={cn(
                "text-sm",
                step.id < currentStep
                  ? "text-gray-500"
                  : step.id === currentStep
                  ? "text-dark"
                  : "text-gray-400"
              )}
            >
              {step.title}
            </span>
          </div>
        ))}
      </div>

      {/* Mobile view */}
      <div className="sm:hidden">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">
            Etapa {currentStep} de {steps.length}
          </span>
          <span className="text-sm text-gray-500">
            {steps[currentStep - 1].title}
          </span>
        </div>
        <div className="mt-2 h-2 w-full rounded-full bg-gray-200">
          <div
            className="h-2 rounded-full bg-primary transition-all"
            style={{ width: `${(currentStep / steps.length) * 100}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentSteps;
