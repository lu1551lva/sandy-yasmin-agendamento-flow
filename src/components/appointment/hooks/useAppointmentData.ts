
import { useState } from "react";
import { Professional, Service, Client } from "@/lib/supabase";

interface AppointmentData {
  service: Service | null;
  professionalId: string | null;
  professional_name?: string;
  date: Date | string;
  time: string | null;
  client: Client | null;
}

export function useAppointmentData(
  selectedService: Service,
  initialDate: Date,
  initialTime: string,
  updateAppointmentData: (data: Partial<AppointmentData>) => void
) {
  const [date, setDate] = useState<Date | undefined>(initialDate);
  const [time, setTime] = useState(initialTime || "");
  const [professionalId, setProfessionalId] = useState("");
  const [professionalName, setProfessionalName] = useState("");

  const handleDateSelect = (newDate: Date | undefined) => {
    setDate(newDate);
    setProfessionalId("");
    setProfessionalName("");
    setTime("");
  };

  const handleProfessionalSelect = (id: string, name: string) => {
    setProfessionalId(id);
    setProfessionalName(name);
    setTime("");
  };

  const handleTimeSelect = (newTime: string) => {
    setTime(newTime);
  };

  const handleContinue = () => {
    if (!date || !time || !professionalId) {
      alert("Por favor, selecione a data, horário e profissional.");
      return false;
    }

    // Update the appointment data including both professional ID and name
    updateAppointmentData({
      date,
      time,
      professionalId,
      professional_name: professionalName
    });

    return true;
  };

  return {
    date,
    time,
    professionalId,
    professionalName,
    handleDateSelect,
    handleProfessionalSelect,
    handleTimeSelect,
    handleContinue
  };
}
