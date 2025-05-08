
/**
 * Utility functions for data security and privacy
 */

/**
 * Masks a phone number, showing only the last 4 digits
 * @param phone The phone number to mask
 * @returns Masked phone number
 */
export const maskPhone = (phone: string): string => {
  if (!phone) return '';
  
  // Remove non-numeric characters for consistent formatting
  const digitsOnly = phone.replace(/\D/g, '');
  
  // If it's a short number, apply simple masking
  if (digitsOnly.length <= 4) {
    return '*'.repeat(digitsOnly.length);
  }
  
  // Show only last 4 digits for standard phone numbers
  return '*'.repeat(digitsOnly.length - 4) + digitsOnly.slice(-4);
};

/**
 * Masks an email address, showing only first character and domain
 * @param email The email to mask
 * @returns Masked email
 */
export const maskEmail = (email: string): string => {
  if (!email || !email.includes('@')) return '';
  
  const [username, domain] = email.split('@');
  
  // Show only first character of username + *** + domain
  return `${username.charAt(0)}${'*'.repeat(Math.max(2, username.length - 1))}@${domain}`;
};

/**
 * Cleans sensitive data from the browser (localStorage)
 */
export const clearSensitiveData = (): void => {
  // Clear any client data from localStorage
  localStorage.removeItem('clientData');
  localStorage.removeItem('lastViewedClient');
  localStorage.removeItem('appointmentDetails');
  
  // Clear any cached form data
  localStorage.removeItem('appointmentForm');
  localStorage.removeItem('clientForm');
  
  console.log('Sensitive data cleared from browser storage');
};
