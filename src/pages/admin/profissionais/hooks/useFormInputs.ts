
import { ProfessionalFormData, ProfessionalFormField } from "../types/professional-state";

interface UseFormInputsProps {
  formData: ProfessionalFormData;
  setFormData: (data: ProfessionalFormData) => void;
  setErrors: (errors: Record<string, string>) => void;
}

export function useFormInputs({
  formData,
  setFormData,
  setErrors,
}: UseFormInputsProps) {
  const handleChange = (field: ProfessionalFormField, value: any) => {
    setFormData({ ...formData, [field]: value });
    
    if (field in formData) {
      setErrors({});
    }
  };

  const toggleDay = (day: string) => {
    const days = Array.isArray(formData.dias_atendimento) 
      ? [...formData.dias_atendimento] 
      : [];
    
    const newDays = days.includes(day)
      ? days.filter(d => d !== day)
      : [...days, day];
    
    setFormData({ ...formData, dias_atendimento: newDays });
    setErrors({});
  };

  return {
    handleChange,
    toggleDay,
  };
}
