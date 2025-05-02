
/**
 * Utility to check if a given date and time are in the past
 * This is used to validate appointment completions
 */
export const isInPast = (dateStr: string, timeStr: string): boolean => {
  const now = new Date();
  
  if (!dateStr || !timeStr) return false;
  
  try {
    // Parse date (expecting yyyy-MM-dd format)
    const [year, month, day] = dateStr.split('-').map(num => parseInt(num, 10));
    
    // Parse time (expecting HH:mm format)
    const [hour, minute] = timeStr.split(':').map(num => parseInt(num, 10));
    
    // Create appointment date object (months are 0-indexed in JavaScript)
    const appointmentDate = new Date(year, month - 1, day, hour, minute);
    
    // Debug logging
    console.log(`Comparing: Appointment time ${appointmentDate.toISOString()} with current time ${now.toISOString()}`);
    
    return appointmentDate < now;
  } catch (e) {
    console.error('Error in isInPast function:', e);
    return false;
  }
};
