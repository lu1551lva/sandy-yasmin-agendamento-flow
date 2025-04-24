
import { Professional } from "@/lib/supabase";
import { ProfessionalFormData } from "../types/professional-state";

interface UseSubmitProfessionalProps {
  isEditing: boolean;
  currentProfessional: Professional | null;
  formData: ProfessionalFormData;
  validateForm: () => boolean;
  setIsLoading: (loading: boolean) => void;
  createProfessionalMutation: any;
  updateProfessionalMutation: any;
  salaoId?: string | null;
}

export const useSubmitProfessional = ({
  isEditing,
  currentProfessional,
  formData,
  validateForm,
  setIsLoading,
  createProfessionalMutation,
  updateProfessionalMutation,
  salaoId
}: UseSubmitProfessionalProps) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Enviando formulário com dados:", formData);
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    if (isEditing && currentProfessional) {
      updateProfessionalMutation.mutate({
        id: currentProfessional.id,
        professional: {
          ...formData,
          salao_id: currentProfessional.salao_id || salaoId
        },
      });
    } else {
      createProfessionalMutation.mutate({
        ...formData,
        salao_id: salaoId
      });
    }
  };

  return { handleSubmit };
};
