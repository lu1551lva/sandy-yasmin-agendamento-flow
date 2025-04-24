
import { Professional } from "@/lib/supabase";
import type { UseToastReturn } from "@/hooks/use-toast";

export interface UseProfessionalCRUDProps {
  toast: UseToastReturn;
  setIsDialogOpen: (open: boolean) => void;
  setIsDeleteDialogOpen: (open: boolean) => void;
  resetForm: () => void;
  setCurrentProfessional: (professional: Professional | null) => void;
  setIsLoading: (loading: boolean) => void;
}
