
import { Service } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { DateSelector } from "@/components/shared/date-time/DateSelector";
import { ProfessionalSelector } from "@/components/shared/date-time/ProfessionalSelector";
import { TimeSelector } from "@/components/shared/date-time/TimeSelector";
import { useTimeSlots } from "@/components/shared/date-time/hooks/useTimeSlots";
import { useAppointmentData } from "./hooks/useAppointmentData";
import { useProfessionals } from "./hooks/useProfessionals";
import { useDateValidation } from "./hooks/useDateValidation";
import { useState } from "react";

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
    handleDateSelect,
    handleProfessionalSelect,
    handleTimeSelect,
    handleContinue
  } = useAppointmentData(selectedService, selectedDate, selectedTime, updateAppointmentData);

  const { professionals, isLoading, error } = useProfessionals(date);
  const [appointments, setAppointments] = useState<any[]>([]);

  // Find the selected professional
  const selectedProfessional = professionals.find(p => p.id === professionalId);
  
  // Use the new date validation hook
  const dateValidation = useDateValidation(selectedProfessional);
  
  // Generate available time slots
  const availableTimes = useTimeSlots({
    date,
    selectedService,
    professional: selectedProfessional,
    appointments
  });

  const onDateSelect = (newDate: Date | undefined) => {
    if (newDate && dateValidation.validateDate(newDate)) {
      handleDateSelect(newDate);
    }
  };

  const onContinue = () => {
    if (handleContinue()) {
      updateAppointmentData({
        date,
        time,
        professionalId,
        professional_name: selectedProfessional?.nome
      });
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
          onProfessionalSelect={handleProfessionalSelect}
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
