
import { Professional } from "@/lib/supabase";
import { ProfessionalFormData, ProfessionalFormField } from "../types/professional-state";
import { useEditProfessional } from "./useEditProfessional";
import { useFormInputs } from "./useFormInputs";
import { useFormValidation } from "./useFormValidation";

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
  const { handleEdit } = useEditProfessional({
    setCurrentProfessional,
    setFormData,
    setIsEditing,
    setIsDialogOpen,
  });

  const { handleChange, toggleDay } = useFormInputs({
    formData,
    setFormData,
    setErrors,
  });

  const { validateForm: validateFormImpl } = useFormValidation({
    setErrors,
  });

  const validateForm = () => validateFormImpl(formData);

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
