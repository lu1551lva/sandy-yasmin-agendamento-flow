
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase, Professional } from "@/lib/supabase";

type UseProfessionalsCRUDProps = {
  setIsDialogOpen: (open: boolean) => void;
  setIsDeleteDialogOpen: (open: boolean) => void;
  resetForm: () => void;
  setCurrentProfessional: (professional: Professional | null) => void;
  toast: any;
};

export function useProfessionalsCRUD({
  setIsDialogOpen,
  setIsDeleteDialogOpen,
  resetForm,
  setCurrentProfessional,
  toast,
}: UseProfessionalsCRUDProps) {
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  // Fetch all professionals
  const { data: professionals = [] } = useQuery({
    queryKey: ["professionals"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profissionais")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching professionals:", error);
        throw error;
      }

      return data as Professional[];
    },
  });

  // Create new professional
  const createProfessionalMutation = useMutation({
    mutationFn: async (professional: Omit<Professional, "id" | "created_at">) => {
      console.log("Creating professional with data:", professional);
      const { data, error } = await supabase
        .from("profissionais")
        .insert(professional)
        .select()
        .single();

      if (error) {
        console.error("Error creating professional:", error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["professionals"] });
      toast({ title: "Profissional cadastrada com sucesso" });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      console.error("Create professional error:", error);
      let errorMessage = "Erro ao cadastrar profissional";
      
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'object' && error !== null) {
        errorMessage = JSON.stringify(error);
      }
      
      toast({
        title: "Erro ao cadastrar",
        description: errorMessage,
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
      professional: Partial<Professional>;
    }) => {
      console.log("Updating professional with ID:", id);
      console.log("Update data:", professional);
      
      // Ensure dias_atendimento is an array of strings
      if (professional.dias_atendimento && !Array.isArray(professional.dias_atendimento)) {
        professional.dias_atendimento = Object.entries(professional.dias_atendimento)
          .filter(([_, checked]) => checked)
          .map(([day]) => day);
      }
      
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
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["professionals"] });
      toast({ title: "Profissional atualizada com sucesso" });
      setIsDialogOpen(false);
      resetForm();
      setCurrentProfessional(null);
    },
    onError: (error) => {
      console.error("Update professional error:", error);
      let errorMessage = "Erro ao atualizar profissional";
      
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'object' && error !== null) {
        errorMessage = JSON.stringify(error);
      }
      
      toast({
        title: "Erro ao atualizar",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  // Delete professional
  const deleteProfessionalMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("profissionais")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Error deleting professional:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["professionals"] });
      toast({ title: "Profissional excluída com sucesso" });
      setIsDeleteDialogOpen(false);
      setCurrentProfessional(null);
    },
    onError: (error) => {
      console.error("Delete professional error:", error);
      let errorMessage = "Erro ao excluir profissional";
      
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'object' && error !== null) {
        errorMessage = JSON.stringify(error);
      }
      
      toast({
        title: "Erro ao excluir",
        description: errorMessage,
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
