
import React, { useState, useEffect } from "react";
import { Service } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { DateSelector } from "@/components/shared/date-time/DateSelector";
import { ProfessionalSelector } from "@/components/shared/date-time/ProfessionalSelector";
import { TimeSelector } from "@/components/shared/date-time/TimeSelector";
import { useTimeSlots } from "@/components/shared/date-time/hooks/useTimeSlots";
import { useAppointmentData } from "./hooks/useAppointmentData";
import { useProfessionals } from "./hooks/useProfessionals";
import { useDateValidation } from "@/hooks/useDateValidation";
import { useToast } from "@/hooks/use-toast";

interface DateSelectionProps {
  selectedService: Service;
  selectedDate: Date;
  selectedTime: string;
  updateAppointmentData: (data: any) => void;
  nextStep: () => void;
  prevStep: () => void;
}

const DateAndTimeSelector = ({
  selectedService,
  selectedDate,
  selectedTime,
  updateAppointmentData,
  nextStep,
  prevStep,
}: DateSelectionProps) => {
  const {
    date,
    time,
    professionalId,
    professionalName,
    handleDateSelect,
    handleProfessionalSelect,
    handleTimeSelect,
    handleContinue
  } = useAppointmentData(selectedService, selectedDate, selectedTime, updateAppointmentData);

  const { professionals, isLoading, error } = useProfessionals(date);
  const [appointments, setAppointments] = useState<any[]>([]);
  const { toast } = useToast();

  // Find the selected professional
  const selectedProfessional = professionals.find(p => p.id === professionalId);
  
  // Use the enhanced date validation hook
  const dateValidation = useDateValidation(selectedProfessional);
  
  // Generate available time slots
  const availableTimes = useTimeSlots({
    date,
    selectedService,
    professional: selectedProfessional,
    appointments
  });

  // When selecting a date, validate it and show appropriate messages
  const onDateSelect = (newDate: Date | undefined) => {
    if (newDate) {
      // Check if the date is a holiday (just for information)
      if (dateValidation.isHoliday(newDate)) {
        toast({
          title: "Data selecionada é um feriado",
          description: "O agendamento é permitido, mas verifique o funcionamento do estabelecimento nesta data.",
          variant: "default", // Using default instead of warning which isn't a valid variant
        });
      }
      
      if (dateValidation.isValidAppointmentDate(newDate)) {
        handleDateSelect(newDate);
      }
    }
  };

  const onProfessionalSelect = (id: string) => {
    const professional = professionals.find(p => p.id === id);
    if (professional) {
      handleProfessionalSelect(id, professional.nome);
    }
  };

  const onContinue = () => {
    if (handleContinue()) {
      nextStep();
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-playfair font-semibold mb-6">
        Data e Horário
      </h2>

      <div className="space-y-6">
        <DateSelector 
          date={date} 
          onDateChange={onDateSelect}
          disabledDates={(date) => dateValidation.isDateDisabled(date)}
        />
        
        {dateValidation.error && (
          <div className="text-destructive text-sm">
            {dateValidation.error}
          </div>
        )}
        
        <ProfessionalSelector
          isLoading={isLoading}
          error={error}
          professionals={professionals}
          selectedProfessionalId={professionalId}
          onProfessionalSelect={onProfessionalSelect}
        />

        <TimeSelector
          professionalId={professionalId}
          availableTimes={availableTimes}
          selectedTime={time}
          onTimeSelect={handleTimeSelect}
        />

        <div className="mt-8 flex justify-between">
          <Button variant="outline" onClick={prevStep}>
            Voltar
          </Button>
          <Button onClick={onContinue}>Continuar</Button>
        </div>
      </div>
    </div>
  );
};

export default DateAndTimeSelector;
