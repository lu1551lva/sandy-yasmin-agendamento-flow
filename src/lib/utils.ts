// Re-export utility functions from their specific files to maintain backward compatibility
// This allows existing imports to keep working without changing all references

// Re-export classnames utility
export { cn } from "./classnames";

// Re-export date utilities
export { 
  formatDate, 
  generateTimeSlots, 
  isHoliday, 
  getHolidays, 
  addHoliday, 
  removeHoliday 
} from "./dateUtils";

// Re-export phone utilities
export { 
  formatPhoneNumber, 
  validateEmail, 
  validatePhone 
} from "./phoneUtils";

// Re-export WhatsApp utilities
export { 
  createWhatsAppLink, 
  formatWhatsAppTemplate, 
  getWhatsAppTemplates 
} from "./whatsappUtils";

// Re-export currency utilities
export { formatCurrency } from "./currencyUtils";
