
// Hooks and types
import { useState } from "react";
import { Service } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { formatDate } from "@/lib/dateUtils";
// Custom hook for all logic
import { useDateSelectionData } from "./hooks/useDateSelectionData";
// Presentational component
import DateAndTimeSelector from "./DateAndTimeSelector";

interface DateSelectionProps {
  selectedService: Service | null;
  selectedDate: Date | null;
  selectedTime: string | null;
  professionalId: string | null;
  updateAppointmentData: (data: { date: Date | null; time: string | null }) => void;
  nextStep: () => void;
  prevStep: () => void;
}

const DateSelection = ({
  selectedService,
  selectedDate,
  selectedTime,
  professionalId,
  updateAppointmentData,
  nextStep,
  prevStep,
}: DateSelectionProps) => {
  // Main logic outsourced to custom hook 
  const {
    availableTimeSlots,
    loading,
    professional,
    isDateDisabled,
    refetchAppointments,
  } = useDateSelectionData(selectedService, selectedDate, professionalId);

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

  return (
    <div>
      <h2 className="text-2xl font-playfair font-semibold mb-6">
        Escolha a data e horário
      </h2>
      <DateAndTimeSelector
        selectedDate={selectedDate}
        selectedTime={selectedTime}
        onSelectDate={handleDateSelect}
        onSelectTime={handleTimeSelect}
        availableTimeSlots={availableTimeSlots}
        loading={loading}
        professional={professional}
        isDateDisabled={isDateDisabled}
      />
      <div className="mt-8 flex justify-between">
        <Button variant="outline" onClick={prevStep}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
        </Button>
        <Button
          onClick={handleContinue}
          disabled={!selectedDate || !selectedTime}
        >
          Continuar
        </Button>
      </div>
    </div>
  );
};

export default DateSelection;
