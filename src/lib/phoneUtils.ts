
// Format phone number to (00) 00000-0000
export const formatPhoneNumber = (value: string) => {
  if (!value) return value;
  const phoneNumber = value.replace(/\D/g, "");
  if (phoneNumber.length <= 2) {
    return `(${phoneNumber}`;
  }
  if (phoneNumber.length <= 7) {
    return `(${phoneNumber.slice(0, 2)}) ${phoneNumber.slice(2)}`;
  }
  if (phoneNumber.length <= 11) {
    return `(${phoneNumber.slice(0, 2)}) ${phoneNumber.slice(2, 7)}-${phoneNumber.slice(7)}`;
  }
  return `(${phoneNumber.slice(0, 2)}) ${phoneNumber.slice(2, 7)}-${phoneNumber.slice(7, 11)}`;
};

// Format phone for WhatsApp API (wa.me)
export const formatPhoneForWhatsApp = (phone: string) => {
  // Remove all non-numeric characters
  const numbersOnly = phone.replace(/\D/g, "");
  
  // Check if it already has country code
  if (numbersOnly.startsWith("55") && (numbersOnly.length === 12 || numbersOnly.length === 13)) {
    return numbersOnly;
  }
  
  // Add Brazil country code if not present
  return `55${numbersOnly}`;
};

// Validate email format
export const validateEmail = (email: string) => {
  if (!email) return false;
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

// Validate phone format - accepts with or without formatting
export const validatePhone = (phone: string) => {
  if (!phone) return false;
  
  // If checking formatted phone
  const formattedRegex = /^\(\d{2}\) \d{4,5}-\d{0,4}$|^\(\d{2}\) \d{0,5}$|^\(\d{0,2}\)$|^\(\d{0,2}$/;
  if (formattedRegex.test(phone)) return true;
  
  // If checking just numbers (10 or 11 digits with DDD)
  const numbersOnly = phone.replace(/\D/g, "");
  return numbersOnly.length >= 10 && numbersOnly.length <= 11;
};
