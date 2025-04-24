
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useProfessionalsCRUD } from "./hooks/useProfessionalsCRUD";
import { useDialogState } from "./hooks/useDialogState";
import { useFormHandlers } from "./hooks/useFormHandlers";
import { Professional } from "@/lib/supabase";

interface UseProfessionalsProps {
  page: number;
  pageSize: number;
}

export const useProfessionals = ({ page, pageSize }: UseProfessionalsProps) => {
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  const dialogState = useDialogState();
  
  const crud = useProfessionalsCRUD({
    page,
    pageSize,
    setIsDialogOpen: dialogState.setIsDialogOpen,
    setIsDeleteDialogOpen: dialogState.setIsDeleteDialogOpen,
    resetForm: dialogState.resetForm,
    setCurrentProfessional: dialogState.setCurrentProfessional,
    toast,
    setIsLoading,
  });

  const formHandlers = useFormHandlers({
    formData: dialogState.formData,
    setFormData: dialogState.setFormData,
    setErrors: dialogState.setErrors,
    setCurrentProfessional: dialogState.setCurrentProfessional,
    setIsEditing: dialogState.setIsEditing,
    setIsDialogOpen: dialogState.setIsDialogOpen,
  });

  const handleDelete = (professional: Professional) => {
    dialogState.setCurrentProfessional(professional);
    dialogState.setIsDeleteDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Enviando formulário com dados:", dialogState.formData);
    
    if (!formHandlers.validateForm()) {
      return;
    }

    setIsLoading(true);
    
    if (dialogState.isEditing && dialogState.currentProfessional) {
      crud.updateProfessionalMutation.mutate({
        id: dialogState.currentProfessional.id,
        professional: dialogState.formData,
      });
    } else {
      crud.createProfessionalMutation.mutate(dialogState.formData);
    }
  };

  return {
    ...dialogState,
    ...crud,
    ...formHandlers,
    isLoading: crud.isLoading || isLoading,
    handleDelete,
    handleSubmit,
  };
};
