
import { useState } from "react";
import { Professional } from "@/lib/supabase";
import { ProfessionalFormData, ProfessionalState } from "../types/professional-state";

const initialFormState: ProfessionalFormData = {
  nome: "",
  dias_atendimento: [],
  horario_inicio: "08:00",
  horario_fim: "18:00",
};

export function useDialogState() {
  const [dialogState, setDialogState] = useState<ProfessionalState>({
    isDialogOpen: false,
    isDeleteDialogOpen: false,
    isEditing: false,
    currentProfessional: null,
    formData: initialFormState,
    errors: {},
  });

  const setIsDialogOpen = (open: boolean) =>
    setDialogState(prev => ({ ...prev, isDialogOpen: open }));

  const setIsDeleteDialogOpen = (open: boolean) =>
    setDialogState(prev => ({ ...prev, isDeleteDialogOpen: open }));

  const setIsEditing = (editing: boolean) =>
    setDialogState(prev => ({ ...prev, isEditing: editing }));

  const setCurrentProfessional = (professional: Professional | null) =>
    setDialogState(prev => ({ ...prev, currentProfessional: professional }));

  const setFormData = (formData: ProfessionalFormData) =>
    setDialogState(prev => ({ ...prev, formData }));

  const setErrors = (errors: Record<string, string>) =>
    setDialogState(prev => ({ ...prev, errors }));

  const resetForm = () => {
    setDialogState(prev => ({
      ...prev,
      formData: initialFormState,
      errors: {},
      isEditing: false,
      currentProfessional: null,
    }));
  };

  return {
    ...dialogState,
    setIsDialogOpen,
    setIsDeleteDialogOpen,
    setIsEditing,
    setCurrentProfessional,
    setFormData,
    setErrors,
    resetForm,
  };
}
