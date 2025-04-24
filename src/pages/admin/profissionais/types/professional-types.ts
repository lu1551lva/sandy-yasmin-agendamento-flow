
import { UseToastReturn } from "@/hooks/use-toast";
import { Professional } from "@/lib/supabase";

export interface UseProfessionalCRUDProps {
  setIsDialogOpen: (open: boolean) => void;
  setIsDeleteDialogOpen: (open: boolean) => void;
  resetForm: () => void;
  setCurrentProfessional: (p: Professional | null) => void;
  toast: UseToastReturn;
  setIsLoading?: (loading: boolean) => void;
}
