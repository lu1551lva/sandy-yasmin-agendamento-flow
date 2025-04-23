
import { useQuery } from "@tanstack/react-query";
import { supabase, Service, Professional } from "@/lib/supabase";
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
  // Fetch services
  const { data: services, isLoading: isLoadingServices, error: servicesError } = useQuery({
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

  // Fetch professionals to get the default professional's UUID
  const { data: professionals, isLoading: isLoadingProfessionals, error: professionalsError } = useQuery({
    queryKey: ["professionals"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profissionais")
        .select("*");

      if (error) throw error;
      return data as Professional[];
    },
  });

  const handleServiceSelect = (service: Service) => {
    // Get the default professional (Sandy Yasmin)
    const defaultProfessional = professionals?.find(p => p.nome === "Sandy Yasmin") || professionals?.[0];
    
    if (!defaultProfessional) {
      console.error("Nenhum profissional encontrado. Verifique se há profissionais cadastrados.");
      return;
    }

    // Use the actual UUID of the professional
    updateAppointmentData({ 
      service,
      professional_id: defaultProfessional.id
    });
  };

  const handleContinue = () => {
    if (selectedService) {
      nextStep();
    }
  };

  const isLoading = isLoadingServices || isLoadingProfessionals;
  const error = servicesError || professionalsError;

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
          Erro ao carregar dados. Por favor, tente novamente.
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
