
import { Professional } from "@/lib/supabase";

interface UseHandleProfessionalProps {
  setCurrentProfessional: (professional: Professional | null) => void;
  setIsDeleteDialogOpen: (open: boolean) => void;
  setIsDialogOpen: (open: boolean) => void;
  setIsEditing: (editing: boolean) => void;
}

export const useHandleProfessional = ({
  setCurrentProfessional,
  setIsDeleteDialogOpen,
  setIsDialogOpen,
  setIsEditing,
}: UseHandleProfessionalProps) => {
  const handleDelete = (professional: Professional) => {
    setCurrentProfessional(professional);
    setIsDeleteDialogOpen(true);
  };

  const openNewProfessionalDialog = () => {
    setCurrentProfessional(null);
    setIsEditing(false);
    setIsDialogOpen(true);
  };

  return {
    handleDelete,
    openNewProfessionalDialog,
  };
};
