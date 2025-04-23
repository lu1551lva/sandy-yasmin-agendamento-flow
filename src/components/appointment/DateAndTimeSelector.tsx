import { useState, useEffect } from "react";
import { format, addMinutes, isWithinInterval } from "date-fns";
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
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getHolidays } from "@/lib/utils";

interface DateSelectionProps {
  selectedService: {
    id: string;
    nome: string;
    valor: number;
    duracao_em_minutos: number;
    created_at: string;
    ativo: boolean;
    salao_id?: string;
  };
  selectedDate: Date;
  selectedTime: string;
  updateAppointmentData: (data: Partial<AppointmentData>) => void;
  nextStep: () => void;
  prevStep: () => void;
  salonId?: string;
}

interface AppointmentData {
  serviceId: string;
  professionalId: string;
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
  salonId,
}: DateSelectionProps) => {
  const [date, setDate] = useState<Date | undefined>(selectedDate);
  const [time, setTime] = useState(selectedTime || "");
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [professionalId, setProfessionalId] = useState("");
  const [availableProfessionals, setAvailableProfessionals] = useState<
    { id: string; nome: string }[]
  >([]);
  const [isDateBlocked, setIsDateBlocked] = useState(false);

  useEffect(() => {
    const checkDateBlocked = () => {
      if (!date) return false;
      const formattedDate = format(date, "yyyy-MM-dd");
      const holidays = getHolidays();
      return holidays.includes(formattedDate);
    };

    setIsDateBlocked(checkDateBlocked());
  }, [date]);

  useEffect(() => {
    const fetchAvailableProfessionals = async () => {
      if (!date || !selectedService) return;

      const dayOfWeek = format(date, "EEEE", { locale: { code: "pt-BR" } });
      const formattedDay = dayOfWeek.charAt(0).toUpperCase() + dayOfWeek.slice(1);

      // Mocked professionals data
      const mockedProfessionals = [
        {
          id: "1",
          nome: "Sandy Yasmin",
          dias_atendimento: ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"],
          horario_inicio: "09:00",
          horario_fim: "18:00",
        },
        {
          id: "2",
          nome: "Outro Profissional",
          dias_atendimento: ["Quarta", "Quinta", "Sexta"],
          horario_inicio: "10:00",
          horario_fim: "16:00",
        },
      ];

      const available = mockedProfessionals.filter((professional) =>
        professional.dias_atendimento.includes(formattedDay)
      );

      setAvailableProfessionals(available);
    };

    fetchAvailableProfessionals();
  }, [date, selectedService]);

  useEffect(() => {
    const generateAvailableTimes = () => {
      if (!date || !selectedService || !professionalId) return [];

      const selectedProfessional = availableProfessionals.find(
        (p) => p.id === professionalId
      );

      if (!selectedProfessional) return [];

      const startTime = selectedProfessional.horario_inicio;
      const endTime = selectedProfessional.horario_fim;
      const serviceDuration = selectedService.duracao_em_minutos;

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

        const isTimeWithinRange = isWithinInterval(timeDate, {
          start: new Date(date.setHours(...startTime.split(":").map(Number))),
          end: new Date(date.setHours(...endTime.split(":").map(Number))),
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

    updateAppointmentData({
      date: formattedDate,
      time: time,
      professionalId: professionalId,
    });
    nextStep();
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
            onSelect={setDate}
            disabled={(date) => {
              if (!date) return false;
              const formattedDate = format(date, "yyyy-MM-dd");
              const holidays = getHolidays();
              return holidays.includes(formattedDate);
            }}
          />
          {isDateBlocked && (
            <p className="text-red-500">
              Esta data está bloqueada. Por favor, selecione outra data.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Selecione o profissional:</CardTitle>
          <CardDescription>Escolha um profissional disponível.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Label htmlFor="professional">Profissional</Label>
          <Select onValueChange={setProfessionalId}>
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Selecione o horário desejado:</CardTitle>
          <CardDescription>Escolha um horário disponível.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Label htmlFor="time">Horário</Label>
          <Select onValueChange={setTime}>
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
