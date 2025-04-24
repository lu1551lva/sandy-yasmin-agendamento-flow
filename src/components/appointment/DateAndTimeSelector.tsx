
import { useState, useEffect } from "react";
import { format, addMinutes, isWithinInterval, isBefore } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase, Professional } from "@/lib/supabase";
import { Loader } from "lucide-react";

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
  date: string;
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
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [professionalId, setProfessionalId] = useState("");
  const [availableProfessionals, setAvailableProfessionals] = useState<Professional[]>([]);
  const [isLoadingProfessionals, setIsLoadingProfessionals] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modified to always allow dates regardless of holidays
  const fetchProfessionals = async () => {
    if (!date || !selectedService) return;

    setIsLoadingProfessionals(true);
    setError(null);
    
    try {
      console.log("Buscando profissionais disponíveis para a data:", date);
      // Get day name in Portuguese
      const dayName = format(date, "EEEE", { locale: ptBR });
      
      // Convert dayName to match dias_atendimento format 
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
      
      // Consulta todos os profissionais - removido filtro de salao_id
      const { data, error } = await supabase
        .from("profissionais")
        .select("*");

      if (error) {
        console.error("Erro ao buscar profissionais:", error);
        throw error;
      }

      if (!data || data.length === 0) {
        console.log("Nenhum profissional encontrado");
        setAvailableProfessionals([]);
        return;
      }

      console.log(`Profissionais encontrados (${data.length}):`, data);
      
      // Filter professionals who work on the selected day
      const available = data.filter((professional) => {
        // Check if dias_atendimento is an array
        if (!Array.isArray(professional.dias_atendimento)) {
          console.warn(`Profissional ${professional.nome} (${professional.id}) com dias_atendimento inválidos:`, professional.dias_atendimento);
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

  // Busca os profissionais quando a data é selecionada
  useEffect(() => {
    fetchProfessionals();
  }, [date, selectedService]);

  // Reseta o profissional selecionado quando a lista de disponíveis muda
  useEffect(() => {
    if (availableProfessionals.length > 0 && !professionalId) {
      // Opcionalmente, selecionar automaticamente o primeiro profissional
      // setProfessionalId(availableProfessionals[0].id);
    } else if (availableProfessionals.length === 0) {
      setProfessionalId("");
    }
  }, [availableProfessionals]);

  // Gera os horários disponíveis para o profissional selecionado
  useEffect(() => {
    const generateAvailableTimes = () => {
      if (!date || !selectedService || !professionalId) return [];

      const selectedProfessional = availableProfessionals.find(
        (p) => p.id === professionalId
      );

      if (!selectedProfessional) return [];

      console.log(`Gerando horários para profissional: ${selectedProfessional.nome}`);
      
      const startTime = selectedProfessional.horario_inicio;
      const endTime = selectedProfessional.horario_fim;
      const serviceDuration = selectedService.duracao_em_minutos;

      console.log(`Horário início: ${startTime}, fim: ${endTime}, duração: ${serviceDuration} min`);

      let currentTime = startTime;
      const times = [];

      while (currentTime <= endTime) {
        const [hours, minutes] = currentTime.split(":").map(Number);
        const currentDate = new Date(date);
        currentDate.setHours(hours, minutes, 0, 0);

        const [endHours, endMinutes] = endTime.split(":").map(Number);
        const endDate = new Date(date);
        endDate.setHours(endHours, endMinutes, 0, 0);

        const timeToAdd = format(currentDate, "HH:mm");

        const timeDate = new Date(date);
        const [timeHours, timeMinutes] = timeToAdd.split(":").map(Number);
        timeDate.setHours(timeHours, timeMinutes, 0, 0);

        // Fix the time range check
        const startHoursNum = parseInt(startTime.split(":")[0]);
        const startMinutesNum = parseInt(startTime.split(":")[1]);
        const endHoursNum = parseInt(endTime.split(":")[0]);
        const endMinutesNum = parseInt(endTime.split(":")[1]);
        
        const startDateTime = new Date(date);
        startDateTime.setHours(startHoursNum, startMinutesNum, 0, 0);
        
        const endDateTime = new Date(date);
        endDateTime.setHours(endHoursNum, endMinutesNum, 0, 0);

        const isTimeWithinRange = isWithinInterval(timeDate, {
          start: startDateTime,
          end: endDateTime
        });

        if (isTimeWithinRange) {
          times.push(timeToAdd);
        }

        const [currentHours, currentMinutes] = currentTime.split(":").map(Number);
        const nextTime = addMinutes(
          new Date(date.setHours(currentHours, currentMinutes, 0, 0)),
          serviceDuration
        );
        currentTime = format(nextTime, "HH:mm");
      }

      console.log(`Horários disponíveis: ${times.join(', ')}`);
      return times;
    };

    setAvailableTimes(generateAvailableTimes());
  }, [date, selectedService, professionalId, availableProfessionals]);

  const handleContinue = () => {
    if (!date || !time || !professionalId) {
      alert("Por favor, selecione a data, horário e profissional.");
      return;
    }

    const formattedDate = format(date, "yyyy-MM-dd");
    const selectedProfessional = availableProfessionals.find(p => p.id === professionalId);

    updateAppointmentData({
      date: formattedDate,
      time: time,
      professionalId: professionalId,
      professional_name: selectedProfessional?.nome
    });
    nextStep();
  };

  const handleDateChange = (newDate: Date | undefined) => {
    if (newDate) {
      setDate(newDate);
      // Reset professional and time when date changes
      setProfessionalId("");
      setTime("");
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-playfair font-semibold mb-6">
        Data e Horário
      </h2>

      <Card>
        <CardHeader>
          <CardTitle>Selecione a data desejada:</CardTitle>
          <CardDescription>Escolha um dia para o agendamento.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleDateChange}
            disabled={(date) => {
              // Só desabilitar datas no passado
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              return date ? isBefore(date, today) : false;
            }}
            locale={ptBR}
            className="pointer-events-auto"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Selecione o profissional:</CardTitle>
          <CardDescription>Escolha um profissional disponível.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Label htmlFor="professional">Profissional</Label>
          {isLoadingProfessionals ? (
            <div className="flex items-center justify-center py-2">
              <Loader className="h-6 w-6 animate-spin" />
              <span className="ml-2">Carregando profissionais...</span>
            </div>
          ) : error ? (
            <div className="text-destructive py-2">{error}</div>
          ) : availableProfessionals.length === 0 ? (
            <div className="text-amber-600 py-2">
              Nenhum profissional disponível para esta data. Por favor, selecione outra data.
            </div>
          ) : (
            <Select onValueChange={setProfessionalId} value={professionalId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione um profissional" />
              </SelectTrigger>
              <SelectContent>
                {availableProfessionals.map((professional) => (
                  <SelectItem key={professional.id} value={professional.id}>
                    {professional.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Selecione o horário desejado:</CardTitle>
          <CardDescription>Escolha um horário disponível.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Label htmlFor="time">Horário</Label>
          {!professionalId ? (
            <div className="text-amber-600 py-2">
              Selecione um profissional para ver os horários disponíveis.
            </div>
          ) : availableTimes.length === 0 ? (
            <div className="text-amber-600 py-2">
              Nenhum horário disponível para este profissional nesta data.
            </div>
          ) : (
            <Select onValueChange={setTime} value={time}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione um horário" />
              </SelectTrigger>
              <SelectContent>
                {availableTimes.map((time) => (
                  <SelectItem key={time} value={time}>
                    {time}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </CardContent>
      </Card>

      <div className="mt-8 flex justify-between">
        <Button variant="outline" onClick={prevStep}>
          Voltar
        </Button>
        <Button onClick={handleContinue}>Continuar</Button>
      </div>
    </div>
  );
};

export default DateAndTimeSelector;
