
import { format, isAfter, isToday, isBefore, startOfDay } from "date-fns";
import { getHolidays } from '@/lib/utils';

/**
 * Hook for validating appointment dates
 */
export const useDateValidation = () => {
  /**
   * Checks if a date is a holiday
   */
  const isHoliday = (date: Date) => {
    if (!date) return false;
    
    const holidays = getHolidays();
    const dateString = format(date, "yyyy-MM-dd");
    return holidays.includes(dateString);
  };

  /**
   * Checks if a date should be disabled in the date picker
   */
  const isDateDisabled = (date: Date) => {
    // Always disable past dates
    const today = startOfDay(new Date());
    const checkDate = startOfDay(new Date(date));
    
    if (isBefore(checkDate, today)) {
      return true;
    }

    // Check if it's a manually added holiday
    if (isHoliday(date)) {
      return true;
    }

    return false;
  };

  /**
   * Checks if a date is valid for appointments
   */
  const isValidAppointmentDate = (date: Date | null | undefined): boolean => {
    if (!date) return false;
    
    const today = startOfDay(new Date());
    const checkDate = startOfDay(new Date(date));
    
    // Not valid if in the past or a holiday
    if (isBefore(checkDate, today) || isHoliday(date)) {
      return false;
    }
    
    return true;
  };

  return {
    isHoliday,
    isDateDisabled,
    isValidAppointmentDate
  };
};
