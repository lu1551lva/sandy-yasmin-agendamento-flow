
import { ProfessionalFormData } from "../types/professional-state";
import { validateProfessionalForm } from "../professionalUtils";

interface UseFormValidationProps {
  setErrors: (errors: Record<string, string>) => void;
}

export function useFormValidation({ setErrors }: UseFormValidationProps) {
  const validateForm = (formData: ProfessionalFormData) => {
    const errors = validateProfessionalForm(formData);
    setErrors(errors);
    return Object.keys(errors).length === 0;
  };

  return { validateForm };
}
