
import { format, parse } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Format a Date object to a string in the format yyyy-MM-dd
export const formatDate = (date: Date | string): string => {
  if (!date) return '';
  
  // If date is already a string, try to parse it first
  if (typeof date === 'string') {
    // Try to parse the string date in different formats
    try {
      if (date.includes('-')) {
        // Already in yyyy-MM-dd format
        return date;
      } else if (date.includes('/')) {
        // Convert from dd/MM/yyyy to yyyy-MM-dd
        const parts = date.split('/');
        return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
      } else {
        return date; // Return as is if unsure
      }
    } catch (e) {
      console.error("Error parsing date string:", e);
      return date;
    }
  }
  
  // Format Date object to yyyy-MM-dd
  return format(date, 'yyyy-MM-dd');
};

// Parse a string date to a Date object
export const parseDate = (dateString: string): Date => {
  if (!dateString) return new Date();
  
  try {
    if (dateString.includes('-')) {
      // yyyy-MM-dd format
      return parse(dateString, 'yyyy-MM-dd', new Date());
    } else if (dateString.includes('/')) {
      // dd/MM/yyyy format
      return parse(dateString, 'dd/MM/yyyy', new Date());
    } else {
      return new Date(dateString);
    }
  } catch (e) {
    console.error("Error parsing date:", e);
    return new Date();
  }
};

// Format date to a localized string (pt-BR)
export const formatLocalDate = (date: Date | string): string => {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? parseDate(date) : date;
  return format(dateObj, 'dd/MM/yyyy', { locale: ptBR });
};

// Get day of week name in Portuguese
export const getDayOfWeekName = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? parseDate(date) : date;
  return format(dateObj, 'EEEE', { locale: ptBR });
};

// Check if the date is today
export const isToday = (date: Date | string): boolean => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const dateObj = typeof date === 'string' ? parseDate(date) : date;
  const compareDate = new Date(dateObj);
  compareDate.setHours(0, 0, 0, 0);
  
  return today.getTime() === compareDate.getTime();
};

// Get a date range for a specific week
export const getWeekDates = (date: Date = new Date()): Date[] => {
  const day = date.getDay(); // 0 is Sunday, 1 is Monday, etc.
  const startDate = new Date(date);
  startDate.setDate(date.getDate() - day); // Go back to Sunday
  
  const weekDates: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + i);
    weekDates.push(currentDate);
  }
  
  return weekDates;
};

// Check if a date + time is in the past
export const isInPast = (dateStr: string, timeStr: string): boolean => {
  const now = new Date();
  
  if (!dateStr || !timeStr) return false;
  
  try {
    // Parse date
    const dateParts = dateStr.includes('-') 
      ? dateStr.split('-')  // yyyy-MM-dd
      : dateStr.split('/').reverse(); // dd/MM/yyyy -> reverse to yyyy,MM,dd
      
    // Parse time
    const timeParts = timeStr.split(':');
    
    // Create date object with date and time
    const appointmentDate = new Date(
      parseInt(dateParts[0]), // year
      parseInt(dateParts[1]) - 1, // month (0-based)
      parseInt(dateParts[2]), // day
      parseInt(timeParts[0]), // hour
      parseInt(timeParts[1])  // minute
    );
    
    return appointmentDate < now;
  } catch (e) {
    console.error('Error checking if date is in past:', e);
    return false;
  }
};
