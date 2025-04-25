
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import AppointmentSteps from "@/components/appointment/AppointmentSteps";
import ServiceSelection from "@/components/appointment/ServiceSelection";
import DateSelection from "@/components/appointment/DateSelection";
import CustomerForm from "@/components/appointment/CustomerForm";
import Confirmation from "@/components/appointment/Confirmation";
import { Service, Client } from "@/lib/supabase";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";

type AppointmentData = {
  service: Service | null;
  professional_id: string | null;
  professionalId?: string | null; // Added for compatibility
  professional_name?: string | null;
  date: Date | null;
  time: string | null;
  client: Client | null;
};

const Appointment = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [appointmentData, setAppointmentData] = useState<AppointmentData>({
    service: null,
    professional_id: null,
    professionalId: null,
    professional_name: null,
    date: null,
    time: null,
    client: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const { toast } = useToast();

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
    const newData = { ...appointmentData, ...data };
    
    // Ensure professional_id is always set correctly
    if (data.professionalId && !data.professional_id) {
      newData.professional_id = data.professionalId;
    }
    
    // And vice versa for backward compatibility
    if (data.professional_id && !data.professionalId) {
      newData.professionalId = data.professional_id;
    }
    
    setAppointmentData(newData);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <ServiceSelection
            selectedService={appointmentData.service}
            updateAppointmentData={updateAppointmentData}
            nextStep={nextStep}
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
          />
        );
      case 3:
        return (
          <CustomerForm
            client={appointmentData.client}
            updateAppointmentData={updateAppointmentData}
            nextStep={nextStep}
            prevStep={prevStep}
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
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-center font-playfair mb-2">
        Studio Sandy Yasmin
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

export default Appointment;
