
// Format phone number with mask
export function formatPhoneNumber(phoneNumber: string): string {
  // Remove all non-digit characters
  const cleaned = phoneNumber.replace(/\D/g, '');
  
  // Check if it's a valid phone number
  if (cleaned.length < 10) return phoneNumber; // Return original if too short
  
  // Format as (XX) XXXXX-XXXX for mobile or (XX) XXXX-XXXX for landline
  if (cleaned.length === 11) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
  } else {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
  }
}

// Format phone for WhatsApp (remove all non-digits and ensure starts with country code)
export function formatPhoneForWhatsApp(phoneNumber: string): string {
  // Remove all non-digit characters
  const cleaned = phoneNumber.replace(/\D/g, '');
  
  // Ensure it has the Brazilian country code (55)
  if (cleaned.startsWith('55')) {
    return cleaned;
  } else {
    return `55${cleaned}`;
  }
}

// Validate email format
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Validate phone number format
export function validatePhone(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, '');
  // Brazilian phone validation: 10 or 11 digits
  return cleaned.length >= 10 && cleaned.length <= 11;
}
