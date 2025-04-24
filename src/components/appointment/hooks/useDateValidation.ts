
import { useState, useCallback } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { getHolidays } from "@/lib/utils";
import { Professional } from "@/lib/supabase";

export const useDateValidation = (professional: Professional | undefined) => {
  const [error, setError] = useState<string | null>(null);

  const isHoliday = useCallback((date: Date) => {
    if (!date) return false;
    const holidays = getHolidays();
    const dateString = format(date, "yyyy-MM-dd");
    return holidays.includes(dateString);
  }, []);

  const isProfessionalAvailable = useCallback((date: Date) => {
    if (!professional || !date) return false;

    const dayName = format(date, "EEEE", { locale: ptBR });
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
    console.log("Checking availability for:", {
      dayName,
      normalizedDay,
      professionalDays: professional.dias_atendimento
    });

    return Array.isArray(professional.dias_atendimento) && 
           professional.dias_atendimento.includes(normalizedDay);
  }, [professional]);

  const validateDate = useCallback((date: Date) => {
    if (!date) {
      setError("Por favor, selecione uma data");
      return false;
    }

    if (isHoliday(date)) {
      setError("Esta data é um feriado");
      return false;
    }

    if (!isProfessionalAvailable(date)) {
      setError("O profissional não atende neste dia");
      return false;
    }

    setError(null);
    return true;
  }, [isHoliday, isProfessionalAvailable]);

  return {
    error,
    isHoliday,
    isProfessionalAvailable,
    validateDate
  };
};
