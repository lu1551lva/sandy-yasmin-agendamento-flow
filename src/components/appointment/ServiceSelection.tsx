
import { useQuery } from "@tanstack/react-query";
import { supabase, Service } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { Loader } from "lucide-react";

interface ServiceSelectionProps {
  selectedService: Service | null;
  updateAppointmentData: (data: { service: Service | null; professional_id: string | null }) => void;
  nextStep: () => void;
}

const ServiceSelection = ({
  selectedService,
  updateAppointmentData,
  nextStep,
}: ServiceSelectionProps) => {
  const { data: services, isLoading, error } = useQuery({
    queryKey: ["services"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("servicos")
        .select("*")
        .order("nome");

      if (error) throw error;
      return data as Service[];
    },
  });

  const handleServiceSelect = (service: Service) => {
    // For simplicity, we're setting the professional_id to the first available one
    // In a real app, you might want to let the user choose a professional
    updateAppointmentData({ 
      service,
      professional_id: "1" // Default professional
    });
  };

  const handleContinue = () => {
    if (selectedService) {
      nextStep();
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-destructive mb-4">
          Erro ao carregar serviços. Por favor, tente novamente.
        </p>
        <Button onClick={() => window.location.reload()}>Recarregar</Button>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-playfair font-semibold mb-6">
        Escolha o serviço
      </h2>
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
        {services?.map((service) => (
          <div
            key={service.id}
            className={`border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
              selectedService?.id === service.id
                ? "border-2 border-primary bg-primary/5"
                : "hover:border-gray-300"
            }`}
            onClick={() => handleServiceSelect(service)}
          >
            <h3 className="font-medium text-lg">{service.nome}</h3>
            <div className="mt-2 flex justify-between items-center">
              <span className="text-primary font-semibold">
                {formatCurrency(service.valor)}
              </span>
              <span className="text-sm text-gray-500">
                {service.duracao_em_minutos} min
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 flex justify-end">
        <Button
          onClick={handleContinue}
          disabled={!selectedService}
          className="w-full sm:w-auto"
        >
          Continuar
        </Button>
      </div>
    </div>
  );
};

export default ServiceSelection;
