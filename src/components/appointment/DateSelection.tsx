
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase, Service } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { format, addDays, isBefore, startOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { generateTimeSlots, isHoliday, formatDate } from "@/lib/utils";
import { Loader, ArrowLeft } from "lucide-react";

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
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const today = new Date();
  const oneMonthLater = addDays(today, 30);

  // Query appointments for the selected date
  const { data: appointments, refetch: refetchAppointments } = useQuery({
    queryKey: ["appointments", selectedDate, professionalId],
    queryFn: async () => {
      if (!selectedDate || !professionalId) return [];

      setLoading(true);
      const dateStr = format(selectedDate, "yyyy-MM-dd");
      
      const { data, error } = await supabase
        .from("agendamentos")
        .select("*")
        .eq("data", dateStr)
        .eq("profissional_id", professionalId)
        .neq("status", "cancelado");

      setLoading(false);
      if (error) throw error;
      return data || [];
    },
    enabled: !!selectedDate && !!professionalId,
  });

  // Update available time slots when date changes
  useEffect(() => {
    if (selectedDate && selectedService) {
      // Get basic time slots for the selected date
      const baseSlots = generateTimeSlots(selectedDate, selectedService.duracao_em_minutos);
      
      // Filter out already booked slots
      const bookedTimes = appointments?.map(app => app.hora) || [];
      const availableTimes = baseSlots.filter(time => !bookedTimes.includes(time));
      
      setAvailableTimeSlots(availableTimes);
    } else {
      setAvailableTimeSlots([]);
    }
  }, [selectedDate, appointments, selectedService]);

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

  const isDateDisabled = (date: Date) => {
    // Disable past dates, holidays, and dates beyond one month
    return (
      isBefore(date, startOfDay(today)) ||
      isHoliday(date) ||
      isBefore(oneMonthLater, date)
    );
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h3 className="font-medium mb-4">Selecione uma data:</h3>
          <Calendar
            mode="single"
            selected={selectedDate || undefined}
            onSelect={handleDateSelect}
            disabled={isDateDisabled}
            locale={ptBR}
            className="rounded-md border shadow p-3 bg-white pointer-events-auto"
          />
          {selectedDate && (
            <p className="mt-2 text-sm text-gray-500">
              Data selecionada: {formatDate(selectedDate)}
            </p>
          )}
        </div>

        <div>
          <h3 className="font-medium mb-4">Selecione um horário:</h3>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : !selectedDate ? (
            <div className="border rounded-md p-8 text-center text-gray-500 h-64 flex items-center justify-center">
              Selecione uma data para ver os horários disponíveis
            </div>
          ) : availableTimeSlots.length === 0 ? (
            <div className="border rounded-md p-8 text-center text-gray-500 h-64 flex items-center justify-center flex-col">
              <p className="mb-2">Não há horários disponíveis nesta data.</p>
              <p className="text-sm">Por favor, selecione outro dia.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-64 overflow-y-auto p-2 border rounded-md">
              {availableTimeSlots.map((time) => (
                <Button
                  key={time}
                  variant={selectedTime === time ? "default" : "outline"}
                  className={`text-sm ${
                    selectedTime === time ? "bg-primary" : "hover:bg-primary/10"
                  }`}
                  onClick={() => handleTimeSelect(time)}
                >
                  {time}
                </Button>
              ))}
            </div>
          )}
        </div>
      </div>

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
