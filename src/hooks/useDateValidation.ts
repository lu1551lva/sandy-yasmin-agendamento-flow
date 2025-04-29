
import { useState, useMemo } from 'react';
import { addDays, isWeekend, isAfter, isBefore } from 'date-fns';

interface UseDateValidationProps {
  disablePastDates?: boolean;
  disableWeekends?: boolean;
  disabledDates?: Date[];
  allowedDays?: number[];
}

export const useDateValidation = (professional?: any) => {
  const [validationError, setValidationError] = useState<string>("");

  // Get allowed days from the professional or use all days if not specified
  const allowedDays = useMemo(() => {
    return professional?.dias_atendimento || [0, 1, 2, 3, 4, 5, 6];
  }, [professional]);

  const isHoliday = (date: Date) => {
    // Exemplo de feriados (apenas para demonstração)
    const holidays = [
      new Date(new Date().getFullYear(), 0, 1),  // Ano Novo
      new Date(new Date().getFullYear(), 11, 25), // Natal
    ];

    return holidays.some(
      holiday => 
        holiday.getDate() === date.getDate() &&
        holiday.getMonth() === date.getMonth() &&
        holiday.getFullYear() === date.getFullYear()
    );
  };

  const isDateDisabled = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Verifica se a data é anterior a hoje (passada)
    if (isBefore(date, today)) {
      return true;
    }

    // Verifica se o dia da semana está nos dias permitidos do profissional
    if (allowedDays && !allowedDays.includes(date.getDay())) {
      return true;
    }

    // Verifica outras restrições, se necessário
    return false;
  };

  const isValidAppointmentDate = (date: Date) => {
    if (!date) return false;

    if (isDateDisabled(date)) {
      setValidationError("Data inválida para agendamento");
      return false;
    }

    setValidationError("");
    return true;
  };

  return {
    isHoliday,
    isDateDisabled,
    isValidAppointmentDate,
    error: validationError
  };
};
