
import { format, isWeekend, isToday as isTodayFn, isBefore, addDays, startOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";

// Format date to standardized Brazilian format (day/month/year)
export const formatDate = (date: Date) => {
  return format(date, "dd/MM/yyyy", { locale: ptBR });
};

// Format time to standardized format
export const formatTime = (date: Date) => {
  return format(date, "HH:mm", { locale: ptBR });
};

// Format date and time for display
export const formatDateTime = (date: Date) => {
  return format(date, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
};

// Format date with month name
export const formatDateWithMonth = (date: Date) => {
  return format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
};

// Format date for weekday display
export const formatWeekday = (date: Date) => {
  return format(date, "EEEE", { locale: ptBR });
};

// Business days and slots

// Generate available time slots
export const generateTimeSlots = (date: Date, serviceDuration: number, ignoreDateRestrictions = false) => {
  if (!ignoreDateRestrictions && isWeekend(date)) {
    return [];
  }
  const startHour = 9;
  const endHour = 18;
  const slotInterval = 30;

  const totalMinutes = (endHour - startHour) * 60;
  const totalSlots = Math.floor(totalMinutes / slotInterval);

  const slots = [];
  for (let i = 0; i < totalSlots; i++) {
    const minutes = i * slotInterval;
    const hour = Math.floor(minutes / 60) + startHour;
    const minute = minutes % 60;

    const timeSlot = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
    slots.push(timeSlot);
  }

  return slots;
};

// --- Holidays ---

// Check if a date is a holiday
export const isHoliday = (date: Date) => {
  const customHolidays = localStorage.getItem('customHolidays');
  const holidayList = customHolidays ? JSON.parse(customHolidays) : [];
  const dateString = format(date, "yyyy-MM-dd");
  return holidayList.includes(dateString);
};

export const getHolidays = () => {
  const savedHolidays = localStorage.getItem('customHolidays');
  return savedHolidays ? JSON.parse(savedHolidays) : [];
};

export const addHoliday = (dateString: string) => {
  const holidays = getHolidays();
  if (!holidays.includes(dateString)) {
    holidays.push(dateString);
    localStorage.setItem('customHolidays', JSON.stringify(holidays));
  }
};

export const removeHoliday = (dateString: string) => {
  const holidays = getHolidays();
  const updatedHolidays = holidays.filter((holiday: string) => holiday !== dateString);
  localStorage.setItem('customHolidays', JSON.stringify(updatedHolidays));
};
