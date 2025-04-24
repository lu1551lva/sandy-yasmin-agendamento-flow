import { useToast } from "@/hooks/use-toast";
import { useProfessionalsCRUD } from "./hooks/useProfessionalsCRUD";
import { useDialogState } from "./hooks/useDialogState";
import { useFormHandlers } from "./hooks/useFormHandlers";
import { useLoading } from "./hooks/useLoading";
import { useHandleProfessional } from "./hooks/useHandleProfessional";
import { useSubmitProfessional } from "./hooks/useSubmitProfessional";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";

interface UseProfessionalsProps {
  page: number;
  pageSize: number;
}

export const useProfessionals = ({ page, pageSize }: UseProfessionalsProps) => {
  const toastHook = useToast();
  const { isLoading, setIsLoading } = useLoading();
  const dialogState = useDialogState();
  const [salaoId, setSalaoId] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchSalaoId = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session?.user?.id) {
        setSalaoId(data.session.user.id);
      }
    };
    
    fetchSalaoId();
  }, []);
  
  const crud = useProfessionalsCRUD({
    page,
    pageSize,
    setIsDialogOpen: dialogState.setIsDialogOpen,
    setIsDeleteDialogOpen: dialogState.setIsDeleteDialogOpen,
    resetForm: dialogState.resetForm,
    setCurrentProfessional: dialogState.setCurrentProfessional,
    toast: toastHook,
    setIsLoading,
    salaoId
  });

  const formHandlers = useFormHandlers({
    formData: dialogState.formData,
    setFormData: dialogState.setFormData,
    setErrors: dialogState.setErrors,
    setCurrentProfessional: dialogState.setCurrentProfessional,
    setIsEditing: dialogState.setIsEditing,
    setIsDialogOpen: dialogState.setIsDialogOpen,
  });

  const { handleDelete, openNewProfessionalDialog } = useHandleProfessional({
    setCurrentProfessional: dialogState.setCurrentProfessional,
    setIsDeleteDialogOpen: dialogState.setIsDeleteDialogOpen,
    setIsDialogOpen: dialogState.setIsDialogOpen,
    setIsEditing: dialogState.setIsEditing,
  });

  const { handleSubmit } = useSubmitProfessional({
    isEditing: dialogState.isEditing,
    currentProfessional: dialogState.currentProfessional,
    formData: dialogState.formData,
    validateForm: formHandlers.validateForm,
    setIsLoading,
    createProfessionalMutation: crud.createProfessionalMutation,
    updateProfessionalMutation: crud.updateProfessionalMutation,
    salaoId
  });

  return {
    ...dialogState,
    ...crud,
    ...formHandlers,
    isLoading: crud.isLoading || isLoading,
    handleDelete,
    handleSubmit,
    openNewProfessionalDialog,
    salaoId
  };
};
