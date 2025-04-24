
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { supabase, Professional } from "@/lib/supabase";
import { DateSelector } from "@/components/shared/date-time/DateSelector";
import { ProfessionalSelector } from "@/components/shared/date-time/ProfessionalSelector";
import { TimeSelector } from "@/components/shared/date-time/TimeSelector";
import { useTimeSlots } from "@/components/shared/date-time/hooks/useTimeSlots";
import { getHolidays } from "@/lib/utils";

interface DateSelectionProps {
  selectedService: {
    id: string;
    nome: string;
    valor: number;
    duracao_em_minutos: number;
    created_at: string;
    ativo: boolean;
  };
  selectedDate: Date;
  selectedTime: string;
  updateAppointmentData: (data: Partial<AppointmentData>) => void;
  nextStep: () => void;
  prevStep: () => void;
}

interface AppointmentData {
  serviceId: string;
  professionalId: string;
  professional_name?: string;
  date: Date | string; // Updated to allow both Date and string
  time: string;
  client: {
    nome: string;
    telefone: string;
    email: string;
  };
}

const DateAndTimeSelector = ({
  selectedService,
  selectedDate,
  selectedTime,
  updateAppointmentData,
  nextStep,
  prevStep,
}: DateSelectionProps) => {
  const [date, setDate] = useState<Date | undefined>(selectedDate);
  const [time, setTime] = useState(selectedTime || "");
  const [professionalId, setProfessionalId] = useState("");
  const [availableProfessionals, setAvailableProfessionals] = useState<Professional[]>([]);
  const [isLoadingProfessionals, setIsLoadingProfessionals] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [appointments, setAppointments] = useState<any[]>([]);

  // Check if date is holiday
  const isHoliday = (date: Date) => {
    if (!date) return false;
    const holidays = getHolidays();
    const dateString = format(date, "yyyy-MM-dd");
    return holidays.includes(dateString);
  };

  // Fetch professionals when date changes
  useEffect(() => {
    const fetchProfessionals = async (selectedDate: Date) => {
      if (!selectedDate) return;

      setIsLoadingProfessionals(true);
      setError(null);
      
      try {
        console.log("Buscando profissionais disponíveis para a data:", selectedDate);
        const dayName = format(selectedDate, "EEEE", { locale: ptBR });
        
        const dayMap: { [key: string]: string } = {
          'domingo': 'domingo',
          'segunda-feira': 'segunda', 
          'terça-feira': 'terca',
          'quarta-feira': 'quarta',
          'quinta-feira': 'quinta',
          'sexta-feira': 'sexta',
          'sábado': 'sabado'
        };
        
        const normalizedDay = dayMap[dayName];
        console.log(`Dia da semana normalizado: ${normalizedDay}`);
        
        // Fetch all professionals
        const { data, error } = await supabase
          .from("profissionais")
          .select("*");

        if (error) throw error;

        if (!data || data.length === 0) {
          console.log("Nenhum profissional encontrado");
          setAvailableProfessionals([]);
          return;
        }

        // Filter professionals who work on this day
        const available = data.filter((professional) => {
          if (!Array.isArray(professional.dias_atendimento)) {
            console.warn(`Profissional ${professional.nome} com dias_atendimento inválidos:`, professional.dias_atendimento);
            return false;
          }
          
          const works = professional.dias_atendimento.includes(normalizedDay);
          console.log(`Profissional ${professional.nome} trabalha no dia ${normalizedDay}? ${works ? 'Sim' : 'Não'}`);
          return works;
        });

        console.log(`Profissionais disponíveis (${available.length}):`, available);
        setAvailableProfessionals(available);
      } catch (err) {
        console.error("Erro ao buscar profissionais:", err);
        setError("Erro ao carregar os profissionais. Por favor, tente novamente.");
      } finally {
        setIsLoadingProfessionals(false);
      }
    };

    if (date) {
      fetchProfessionals(date);
    }
  }, [date]);

  // Fetch appointments for the selected date and professional
  useEffect(() => {
    const fetchAppointments = async () => {
      if (!date || !professionalId) {
        setAppointments([]);
        return;
      }
      
      const dateStr = format(date, "yyyy-MM-dd");
      try {
        const { data, error } = await supabase
          .from("agendamentos")
          .select("*")
          .eq("data", dateStr)
          .eq("profissional_id", professionalId)
          .neq("status", "cancelado");
          
        if (error) throw error;
        setAppointments(data || []);
      } catch (err) {
        console.error("Erro ao buscar agendamentos:", err);
      }
    };
    
    fetchAppointments();
  }, [date, professionalId]);

  const handleDateSelect = (newDate: Date | undefined) => {
    setDate(newDate);
    setProfessionalId("");
    setTime("");
  };

  const handleProfessionalSelect = (id: string) => {
    setProfessionalId(id);
    setTime("");
  };

  const handleTimeSelect = (newTime: string) => {
    setTime(newTime);
  };

  const handleContinue = () => {
    if (!date || !time || !professionalId) {
      alert("Por favor, selecione a data, horário e profissional.");
      return;
    }

    const selectedProfessional = availableProfessionals.find(p => p.id === professionalId);

    updateAppointmentData({
      date: date, // This is the line causing the type error - fixed by updating the AppointmentData interface
      time,
      professionalId,
      professional_name: selectedProfessional?.nome
    });
    nextStep();
  };

  // Find the selected professional
  const selectedProfessional = availableProfessionals.find(p => p.id === professionalId);
  
  // Generate available time slots
  const availableTimes = useTimeSlots({
    date,
    selectedService,
    professional: selectedProfessional,
    appointments
  });

  // Custom disabled dates function
  const isDateDisabled = (date: Date) => {
    // Only disable past dates and manually added holidays
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (date < today) return true;
    if (isHoliday(date)) return true;
    
    return false;
  };

  return (
    <div>
      <h2 className="text-2xl font-playfair font-semibold mb-6">
        Data e Horário
      </h2>

      <div className="space-y-6">
        <DateSelector 
          date={date} 
          onDateChange={handleDateSelect}
          disabledDates={isDateDisabled}
        />
        
        <ProfessionalSelector
          isLoading={isLoadingProfessionals}
          error={error}
          professionals={availableProfessionals}
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
          <Button onClick={handleContinue}>Continuar</Button>
        </div>
      </div>
    </div>
  );
};

export default DateAndTimeSelector;
