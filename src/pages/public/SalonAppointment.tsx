
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import AppointmentSteps from "@/components/appointment/AppointmentSteps";
import ServiceSelection from "@/components/appointment/ServiceSelection";
import DateSelection from "@/components/appointment/DateSelection";
import CustomerForm from "@/components/appointment/CustomerForm";
import Confirmation from "@/components/appointment/Confirmation";
import { Service, Client, getSalonBySlug, Salon } from "@/lib/supabase";
import { Card, CardContent } from "@/components/ui/card";
import { Loader } from "lucide-react";
import { format } from "date-fns";

type AppointmentData = {
  service: Service | null;
  professional_id: string | null;
  professional_name?: string | null;
  date: Date | null;
  time: string | null;
  client: Client | null;
  salon_id?: string;
};

const SalonAppointment = () => {
  const { slug } = useParams<{ slug: string }>();
  const [currentStep, setCurrentStep] = useState(1);
  const [appointmentData, setAppointmentData] = useState<AppointmentData>({
    service: null,
    professional_id: null,
    professional_name: null,
    date: null,
    time: null,
    client: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [loading, setLoading] = useState(true);
  const [salon, setSalon] = useState<Salon | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const loadSalon = async () => {
      if (!slug) {
        navigate('/');
        return;
      }

      setLoading(true);
      const salonData = await getSalonBySlug(slug);

      if (!salonData) {
        toast({
          title: "Salon não encontrado",
          description: "O salão que você está procurando não existe ou foi removido.",
          variant: "destructive",
        });
        navigate('/');
        return;
      }

      if (salonData.status === 'inativo') {
        toast({
          title: "Salon inativo",
          description: "Este salão não está aceitando agendamentos no momento.",
          variant: "destructive",
        });
        navigate('/');
        return;
      }

      setSalon(salonData);
      setAppointmentData(prev => ({ ...prev, salon_id: salonData.id }));
      setLoading(false);
    };

    loadSalon();
  }, [slug, navigate, toast]);

  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
      window.scrollTo(0, 0);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo(0, 0);
    }
  };

  const updateAppointmentData = (data: Partial<AppointmentData>) => {
    setAppointmentData({ ...appointmentData, ...data });
  };

  const renderStepContent = () => {
    if (!salon) return null;

    switch (currentStep) {
      case 1:
        return (
          <ServiceSelection
            selectedService={appointmentData.service}
            updateAppointmentData={updateAppointmentData}
            nextStep={nextStep}
            salonId={salon.id}
          />
        );
      case 2:
        return (
          <DateSelection
            selectedService={appointmentData.service}
            selectedDate={appointmentData.date}
            selectedTime={appointmentData.time}
            professionalId={appointmentData.professional_id}
            updateAppointmentData={updateAppointmentData}
            nextStep={nextStep}
            prevStep={prevStep}
            salonId={salon.id}
          />
        );
      case 3:
        return (
          <CustomerForm
            client={appointmentData.client}
            updateAppointmentData={updateAppointmentData}
            nextStep={nextStep}
            prevStep={prevStep}
            salonId={salon.id}
          />
        );
      case 4:
        // Convert Date to string for Confirmation component
        const confirmationData = {
          ...appointmentData,
          date: appointmentData.date ? format(appointmentData.date, 'yyyy-MM-dd') : '',
        };
        
        return (
          <Confirmation
            appointmentData={confirmationData}
            isSubmitting={isSubmitting}
            isComplete={isComplete}
            setIsSubmitting={setIsSubmitting}
            setIsComplete={setIsComplete}
            prevStep={prevStep}
            salonId={salon.id}
          />
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-center font-playfair mb-2">
        Agendamento Online - {salon?.nome}
      </h1>
      <p className="text-center text-muted-foreground mb-8">
        Reserve seu horário em poucos passos
      </p>

      <AppointmentSteps currentStep={currentStep} />

      <Card className="mt-8 shadow-md animate-fade-in">
        <CardContent className="pt-6">{renderStepContent()}</CardContent>
      </Card>
    </div>
  );
};

export default SalonAppointment;
