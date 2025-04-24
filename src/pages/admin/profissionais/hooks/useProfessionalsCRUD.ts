
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase, Professional } from "@/lib/supabase";

interface UseProfessionalsCRUDProps {
  setIsDialogOpen: (isOpen: boolean) => void;
  setIsDeleteDialogOpen: (isOpen: boolean) => void;
  resetForm: () => void;
  setCurrentProfessional: (professional: Professional | null) => void;
  toast: {
    toast: (props: { title: string; description?: string; variant?: "default" | "destructive" }) => void;
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

  const { data: professionals = [], isLoading } = useQuery({
    queryKey: ["professionals"],
    queryFn: async () => {
      console.log("Fetching professionals...");
      const { data, error } = await supabase
        .from("profissionais")
        .select("*")
        .order("nome");

      if (error) {
        console.error("Error fetching professionals:", error);
        throw error;
      }

      // Log the professionals data structure for debugging
      console.log("Professionals data structure:", data);
      
      return data as Professional[];
    },
  });

  const createProfessionalMutation = useMutation({
    mutationFn: async (professionalData: Omit<Professional, "id" | "created_at">) => {
      console.log("Creating professional with data:", professionalData);
      
      // Ensure dias_atendimento is an array of strings
      const diasAtendimento = Array.isArray(professionalData.dias_atendimento) 
        ? professionalData.dias_atendimento 
        : [];
      
      const { data, error } = await supabase
        .from("profissionais")
        .insert({
          ...professionalData,
          dias_atendimento: diasAtendimento
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["professionals"] });
      setIsDialogOpen(false);
      resetForm();
      toast.toast({
        title: "Profissional criado com sucesso",
        variant: "default",
      });
    },
    onError: (error: any) => {
      console.error("Error creating professional:", error);
      // Log the full error to console for debugging
      console.error("Full error details:", JSON.stringify(error));
      toast.toast({
        title: "Erro ao criar profissional",
        description: error.message || JSON.stringify(error),
        variant: "destructive",
      });
    },
  });

  const updateProfessionalMutation = useMutation({
    mutationFn: async ({
      id,
      professional,
    }: {
      id: string;
      professional: Partial<Professional>;
    }) => {
      console.log("Updating professional with ID:", id);
      console.log("Update data:", professional);
      
      // Ensure dias_atendimento is an array of strings if provided
      const professionalData = { ...professional };
      
      if (professionalData.dias_atendimento) {
        if (typeof professionalData.dias_atendimento === 'object' && !Array.isArray(professionalData.dias_atendimento)) {
          // Convert object format {day: boolean} to string array ["day1", "day2"]
          console.log("Converting dias_atendimento from object to array");
          const diasObject = professionalData.dias_atendimento as unknown as Record<string, boolean>;
          professionalData.dias_atendimento = Object.entries(diasObject)
            .filter(([_, selected]) => selected)
            .map(([day]) => day);
        } else if (!Array.isArray(professionalData.dias_atendimento)) {
          // Fallback to empty array if it's not an object or an array
          console.log("Setting dias_atendimento to empty array");
          professionalData.dias_atendimento = [];
        }
      }
      
      console.log("Processed update data:", professionalData);
      
      const { data, error } = await supabase
        .from("profissionais")
        .update(professionalData)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("Supabase update error:", error);
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["professionals"] });
      setIsDialogOpen(false);
      resetForm();
      toast.toast({
        title: "Profissional atualizado com sucesso",
        variant: "default",
      });
    },
    onError: (error: any) => {
      console.error("Error updating professional:", error);
      // Log the full error to console for debugging
      console.error("Full error details:", JSON.stringify(error));
      toast.toast({
        title: "Erro ao atualizar profissional",
        description: error.message || JSON.stringify(error),
        variant: "destructive",
      });
    },
  });

  const deleteProfessionalMutation = useMutation({
    mutationFn: async (id: string) => {
      console.log("Deleting professional with ID:", id);
      const { error } = await supabase.from("profissionais").delete().eq("id", id);
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["professionals"] });
      setIsDeleteDialogOpen(false);
      setCurrentProfessional(null);
      toast.toast({
        title: "Profissional excluído com sucesso",
        variant: "default",
      });
    },
    onError: (error: any) => {
      console.error("Error deleting professional:", error);
      // Log the full error to console for debugging
      console.error("Full error details:", JSON.stringify(error));
      toast.toast({
        title: "Erro ao excluir profissional",
        description: error.message || JSON.stringify(error),
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
}
