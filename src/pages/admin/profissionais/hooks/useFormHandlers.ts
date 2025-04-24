
import { Professional } from "@/lib/supabase";
import { ProfessionalFormData, ProfessionalFormField } from "../types/professional-state";
import { validateProfessionalForm } from "../professionalUtils";

interface UseFormHandlersProps {
  formData: ProfessionalFormData;
  setFormData: (data: ProfessionalFormData) => void;
  setErrors: (errors: Record<string, string>) => void;
  setCurrentProfessional: (p: Professional | null) => void;
  setIsEditing: (editing: boolean) => void;
  setIsDialogOpen: (open: boolean) => void;
}

export function useFormHandlers({
  formData,
  setFormData,
  setErrors,
  setCurrentProfessional,
  setIsEditing,
  setIsDialogOpen,
}: UseFormHandlersProps) {
  const handleEdit = (professional: Professional) => {
    console.log("Editando profissional:", professional);
    
    const diasAtendimento = Array.isArray(professional.dias_atendimento)
      ? professional.dias_atendimento
      : [];
    
    setCurrentProfessional(professional);
    setFormData({
      nome: professional.nome || "",
      dias_atendimento: diasAtendimento,
      horario_inicio: professional.horario_inicio || "08:00",
      horario_fim: professional.horario_fim || "18:00",
    });
    setIsEditing(true);
    setIsDialogOpen(true);
  };

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

  const validateForm = () => {
    const errors = validateProfessionalForm(formData);
    setErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const openNewProfessionalDialog = () => {
    setCurrentProfessional(null);
    setIsEditing(false);
    setIsDialogOpen(true);
  };

  return {
    handleEdit,
    handleChange,
    toggleDay,
    validateForm,
    openNewProfessionalDialog,
  };
}
