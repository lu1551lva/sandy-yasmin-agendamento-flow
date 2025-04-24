
import { useState } from "react";
import { Service } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { useDateSelectionData } from "./hooks/useDateSelectionData";
import DateAndTimeSelector from "./DateAndTimeSelector";

interface DateSelectionProps {
  selectedService: Service | null;
  selectedDate: Date | null;
  selectedTime: string | null;
  professionalId: string | null;
  updateAppointmentData: (data: { date?: Date | null; time?: string | null; professionalId?: string | null; professional_name?: string }) => void;
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
  const {
    availableTimeSlots,
    loading,
    professional,
    isDateDisabled,
    refetchAppointments,
  } = useDateSelectionData(selectedService, selectedDate, professionalId);

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
        />
      )}
    </div>
  );
};

export default DateSelection;
