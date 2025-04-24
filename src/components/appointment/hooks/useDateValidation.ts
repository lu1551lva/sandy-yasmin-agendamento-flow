
import { useState, useCallback } from "react";
import { format, isWeekend, isBefore } from "date-fns";
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

  const isPastDate = useCallback((date: Date) => {
    if (!date) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return isBefore(date, today);
  }, []);

  const validateDate = useCallback((date: Date) => {
    if (!date) {
      setError("Por favor, selecione uma data");
      return false;
    }

    if (isPastDate(date)) {
      setError("Não é possível selecionar datas passadas");
      return false;
    }

    // Note: We don't block holidays, just inform about them
    if (isHoliday(date)) {
      console.log("Data selecionada é um feriado");
      // We don't set error here as per requirement: feriados não bloqueiam agendamentos
    }

    if (professional && !isProfessionalAvailable(date)) {
      setError("O profissional não atende neste dia");
      return false;
    }

    setError(null);
    return true;
  }, [isHoliday, isProfessionalAvailable, isPastDate, professional]);

  // Create a disabled dates function for the calendar component
  const getDisabledDates = useCallback((date: Date) => {
    // Always disable past dates
    if (isPastDate(date)) return true;
    
    // Only disable days when professional is not available if we have a professional selected
    if (professional) {
      return !isProfessionalAvailable(date);
    }
    
    return false;
  }, [isPastDate, isProfessionalAvailable, professional]);

  return {
    error,
    isHoliday,
    isProfessionalAvailable,
    isPastDate,
    validateDate,
    getDisabledDates
  };
};
