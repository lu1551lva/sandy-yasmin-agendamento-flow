
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase, Professional } from "@/lib/supabase";
import { ToastProps } from "@/components/ui/toast";

export interface UseProfessionalsCRUDProps {
  setIsDialogOpen: (isOpen: boolean) => void;
  setIsDeleteDialogOpen: (isOpen: boolean) => void;
  resetForm: () => void;
  setCurrentProfessional: (professional: Professional | null) => void;
  toast: {
    toast: (props: ToastProps) => void;
  };
}

export interface ProfessionalInput {
  nome: string;
  dias_atendimento: string[];
  horario_inicio: string;
  horario_fim: string;
}

export const useProfessionalsCRUD = ({
  setIsDialogOpen,
  setIsDeleteDialogOpen,
  resetForm,
  setCurrentProfessional,
  toast,
}: UseProfessionalsCRUDProps) => {
  const queryClient = useQueryClient();

  // Fetch professionals
  const { data: professionals = [], isLoading } = useQuery({
    queryKey: ["professionals"],
    queryFn: async () => {
      console.log("Fetching professionals from Supabase");
      try {
        const { data, error } = await supabase
          .from("profissionais")
          .select("*")
          .order("nome");

        if (error) {
          console.error("Error fetching professionals:", error);
          throw error;
        }

        console.log("Professionals fetched successfully:", data);
        return data as Professional[];
      } catch (error) {
        console.error("Error in fetchProfessionals:", error);
        toast.toast({
          title: "Erro ao carregar profissionais",
          variant: "destructive",
        });
        return [];
      }
    },
  });

  // Create professional
  const createProfessionalMutation = useMutation({
    mutationFn: async (professional: ProfessionalInput) => {
      console.log("Creating professional with data:", professional);
      
      // Ensure dias_atendimento is an array of strings
      let diasAtendimento = professional.dias_atendimento;
      if (!Array.isArray(diasAtendimento)) {
        console.error("dias_atendimento is not an array:", diasAtendimento);
        diasAtendimento = [];
      }
      
      try {
        const { data, error } = await supabase
          .from("profissionais")
          .insert({
            nome: professional.nome,
            dias_atendimento: diasAtendimento,
            horario_inicio: professional.horario_inicio,
            horario_fim: professional.horario_fim,
          })
          .select()
          .single();

        if (error) {
          console.error("Error creating professional:", error);
          throw error;
        }
        
        console.log("Professional created successfully:", data);
        return data;
      } catch (error: any) {
        console.error("Error in createProfessional:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["professionals"] });
      setIsDialogOpen(false);
      resetForm();
      toast.toast({
        title: "Profissional cadastrado com sucesso",
      });
    },
    onError: (error: any) => {
      console.error("Mutation error:", error);
      toast.toast({
        title: "Erro ao cadastrar profissional",
        variant: "destructive",
      });
    },
  });

  // Update professional
  const updateProfessionalMutation = useMutation({
    mutationFn: async ({
      id,
      professional,
    }: {
      id: string;
      professional: ProfessionalInput;
    }) => {
      console.log("Updating professional with ID:", id);
      console.log("Update data:", professional);
      
      // Ensure dias_atendimento is an array of strings
      let diasAtendimento = professional.dias_atendimento;
      if (!Array.isArray(diasAtendimento)) {
        console.error("dias_atendimento is not an array:", diasAtendimento);
        diasAtendimento = [];
      }
      
      try {
        const { data, error } = await supabase
          .from("profissionais")
          .update({
            nome: professional.nome,
            dias_atendimento: diasAtendimento,
            horario_inicio: professional.horario_inicio,
            horario_fim: professional.horario_fim,
          })
          .eq("id", id)
          .select()
          .single();

        if (error) {
          console.error("Error updating professional:", error);
          throw error;
        }
        
        console.log("Professional updated successfully:", data);
        return data;
      } catch (error: any) {
        console.error("Error in updateProfessional:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["professionals"] });
      setIsDialogOpen(false);
      setCurrentProfessional(null);
      resetForm();
      toast.toast({
        title: "Profissional atualizado com sucesso",
      });
    },
    onError: (error: any) => {
      console.error("Update mutation error:", error);
      toast.toast({
        title: "Erro ao atualizar profissional",
        variant: "destructive",
      });
    },
  });

  // Delete professional
  const deleteProfessionalMutation = useMutation({
    mutationFn: async (id: string) => {
      console.log("Deleting professional with ID:", id);
      try {
        const { error } = await supabase
          .from("profissionais")
          .delete()
          .eq("id", id);

        if (error) {
          console.error("Error deleting professional:", error);
          throw error;
        }
        
        console.log("Professional deleted successfully");
        return true;
      } catch (error: any) {
        console.error("Error in deleteProfessional:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["professionals"] });
      setIsDeleteDialogOpen(false);
      setCurrentProfessional(null);
      toast.toast({
        title: "Profissional excluído com sucesso",
      });
    },
    onError: (error: any) => {
      console.error("Delete mutation error:", error);
      toast.toast({
        title: "Erro ao excluir profissional",
        variant: "destructive",
      });
    },
  });

  return {
    professionals,
    isLoading,
    createProfessionalMutation,
    updateProfessionalMutation,
    deleteProfessionalMutation,
  };
};
