
import { useFetchProfessionals } from "./useFetchProfessionals";
import { useCreateProfessional } from "./useCreateProfessional";
import { useUpdateProfessional } from "./useUpdateProfessional";
import { useDeleteProfessional } from "./useDeleteProfessional";
import type { UseProfessionalCRUDProps } from "../types/professional-types";

interface UseProfessionalsCRUDProps extends UseProfessionalCRUDProps {
  page: number;
  pageSize: number;
}

export function useProfessionalsCRUD(props: UseProfessionalsCRUDProps) {
  // Fetch all professionals
  const { 
    data: professionals, 
    isLoading 
  } = useFetchProfessionals({
    page: props.page,
    pageSize: props.pageSize
  });

  // Create professional
  const createProfessionalMutation = useCreateProfessional({
    toast: props.toast,
    setIsDialogOpen: props.setIsDialogOpen,
    resetForm: props.resetForm,
    setIsLoading: props.setIsLoading
  });

  // Update professional
  const updateProfessionalMutation = useUpdateProfessional({
    toast: props.toast,
    setIsDialogOpen: props.setIsDialogOpen,
    resetForm: props.resetForm,
    setCurrentProfessional: props.setCurrentProfessional,
    setIsLoading: props.setIsLoading
  });

  // Delete professional
  const deleteProfessionalMutation = useDeleteProfessional({
    toast: props.toast,
    setIsDeleteDialogOpen: props.setIsDeleteDialogOpen,
    setCurrentProfessional: props.setCurrentProfessional
  });

  return {
    professionals,
    isLoading,
    createProfessionalMutation,
    updateProfessionalMutation,
    deleteProfessionalMutation,
  };
}
