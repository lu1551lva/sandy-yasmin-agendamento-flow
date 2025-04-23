
// Hooks and types
import { useState } from "react";
import { Service } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { format } from "date-fns";
// Custom hook for all logic
import { useDateSelectionData } from "./hooks/useDateSelectionData";
// Presentational component
import DateAndTimeSelector from "./DateAndTimeSelector";

interface DateSelectionProps {
  selectedService: Service | null;
  selectedDate: Date | null;
  selectedTime: string | null;
  professionalId: string | null;
  updateAppointmentData: (data: { date?: Date | null; time?: string | null; professionalId?: string | null; professional_name?: string }) => void;
  nextStep: () => void;
  prevStep: () => void;
  salonId?: string;
}

const DateSelection = ({
  selectedService,
  selectedDate,
  selectedTime,
  professionalId,
  updateAppointmentData,
  nextStep,
  prevStep,
  salonId,
}: DateSelectionProps) => {
  // Main logic outsourced to custom hook 
  const {
    availableTimeSlots,
    loading,
    professional,
    isDateDisabled,
    refetchAppointments,
  } = useDateSelectionData(selectedService, selectedDate, professionalId, salonId);

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      updateAppointmentData({ date, time: null });
      refetchAppointments();
    }
  };

  const handleTimeSelect = (time: string) => {
    updateAppointmentData({ date: selectedDate, time });
  };

  const handleContinue = () => {
    if (selectedDate && selectedTime) {
      nextStep();
    }
  };

  if (!selectedService) {
    return (
      <div className="text-center py-8">
        <p className="text-destructive mb-4">
          Por favor, selecione um serviço primeiro.
        </p>
        <Button onClick={prevStep}>Voltar para seleção de serviço</Button>
      </div>
    );
  }

  // Update DateAndTimeSelector to use correct prop names
  return (
    <div>
      <h2 className="text-2xl font-playfair font-semibold mb-6">
        Escolha a data e horário
      </h2>
      {selectedService && (
        <DateAndTimeSelector
          selectedService={selectedService}
          selectedDate={selectedDate || new Date()}
          selectedTime={selectedTime || ""}
          updateAppointmentData={(data) => {
            if (data.date) {
              updateAppointmentData({ 
                date: new Date(data.date), 
                time: data.time,
                professionalId: data.professionalId,
                professional_name: data.professional_name
              });
            }
          }}
          nextStep={nextStep}
          prevStep={prevStep}
          salonId={salonId}
        />
      )}
    </div>
  );
};

export default DateSelection;
