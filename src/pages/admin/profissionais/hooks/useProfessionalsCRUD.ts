
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase, Professional } from "@/lib/supabase";

interface UseProfessionalsCRUDProps {
  setIsDialogOpen: (isOpen: boolean) => void;
  setIsDeleteDialogOpen: (isOpen: boolean) => void;
  resetForm: () => void;
  setCurrentProfessional: (professional: Professional | null) => void;
  toast: {
    toast: (props: { title?: string; variant?: "default" | "destructive" }) => void;
  };
}

export function useProfessionalsCRUD({
  setIsDialogOpen,
  setIsDeleteDialogOpen,
  resetForm,
  setCurrentProfessional,
  toast,
}: UseProfessionalsCRUDProps) {
  const queryClient = useQueryClient();

  // Query to fetch professionals
  const {
    data: professionals = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["professionals"],
    queryFn: async () => {
      const { data, error } = await supabase.from("profissionais").select("*");
      
      if (error) {
        console.error("Error fetching professionals:", error);
        throw error;
      }
      
      return data as Professional[];
    },
  });

  // Mutation to create a new professional
  const createProfessionalMutation = useMutation({
    mutationFn: async (professionalData: Omit<Professional, "id" | "created_at">) => {
      try {
        // Ensure dias_atendimento is an array
        if (professionalData.dias_atendimento && typeof professionalData.dias_atendimento === 'object' && !Array.isArray(professionalData.dias_atendimento)) {
          const diasArray = Object.entries(professionalData.dias_atendimento)
            .filter(([_, checked]) => checked)
            .map(([dia]) => dia);
          
          professionalData = {
            ...professionalData,
            dias_atendimento: diasArray,
          };
        }
        
        console.log("Creating professional with data:", professionalData);
        
        const { data, error } = await supabase
          .from("profissionais")
          .insert(professionalData)
          .select()
          .single();
        
        if (error) {
          console.error("Error creating professional:", error);
          throw error;
        }
        
        return data;
      } catch (error: any) {
        console.error("Error in createProfessionalMutation:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["professionals"] });
      setIsDialogOpen(false);
      resetForm();
      toast.toast({
        title: "Profissional criado com sucesso",
      });
    },
    onError: (error: any) => {
      console.error("Error details:", error);
      // Log the full error to console for debugging
      console.error("Full error:", JSON.stringify(error));
      toast.toast({
        title: `Erro ao criar profissional: ${error.message || JSON.stringify(error)}`,
        variant: "destructive",
      });
    },
  });

  // Mutation to update a professional
  const updateProfessionalMutation = useMutation({
    mutationFn: async ({ id, professional }: { id: string; professional: Partial<Professional> }) => {
      try {
        // Ensure dias_atendimento is an array
        if (professional.dias_atendimento && typeof professional.dias_atendimento === 'object' && !Array.isArray(professional.dias_atendimento)) {
          const diasArray = Object.entries(professional.dias_atendimento)
            .filter(([_, checked]) => checked)
            .map(([dia]) => dia);
          
          professional = {
            ...professional,
            dias_atendimento: diasArray,
          };
        }
        
        console.log("Updating professional with data:", { id, professional });
        
        const { data, error } = await supabase
          .from("profissionais")
          .update(professional)
          .eq("id", id)
          .select()
          .single();
        
        if (error) {
          console.error("Error updating professional:", error);
          throw error;
        }
        
        return data;
      } catch (error: any) {
        console.error("Error in updateProfessionalMutation:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["professionals"] });
      setIsDialogOpen(false);
      resetForm();
      setCurrentProfessional(null);
      toast.toast({
        title: "Profissional atualizado com sucesso",
      });
    },
    onError: (error: any) => {
      console.error("Error details:", error);
      // Log the full error to console for debugging
      console.error("Full error:", JSON.stringify(error));
      toast.toast({
        title: `Erro ao atualizar: ${error.message || JSON.stringify(error)}`,
        variant: "destructive",
      });
    },
  });

  // Mutation to delete a professional
  const deleteProfessionalMutation = useMutation({
    mutationFn: async (id: string) => {
      try {
        console.log("Deleting professional with id:", id);
        
        const { error } = await supabase
          .from("profissionais")
          .delete()
          .eq("id", id);
        
        if (error) {
          console.error("Error deleting professional:", error);
          throw error;
        }
        
        return id;
      } catch (error: any) {
        console.error("Error in deleteProfessionalMutation:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["professionals"] });
      setIsDeleteDialogOpen(false);
      toast.toast({
        title: "Profissional excluído com sucesso",
      });
    },
    onError: (error: any) => {
      console.error("Error details:", error);
      // Log the full error to console for debugging
      console.error("Full error:", JSON.stringify(error));
      toast.toast({
        title: `Erro ao excluir: ${error.message || JSON.stringify(error)}`,
        variant: "destructive",
      });
    },
  });

  return {
    professionals,
    isLoading,
    error,
    createProfessionalMutation,
    updateProfessionalMutation,
    deleteProfessionalMutation,
  };
}
