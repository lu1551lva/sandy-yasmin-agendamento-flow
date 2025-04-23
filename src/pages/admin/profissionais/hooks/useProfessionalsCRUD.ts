
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase, Professional } from "@/lib/supabase";
import { useAuth } from "@/context/auth-context";

interface UseProfessionalsCRUDProps {
  setIsDialogOpen: (isOpen: boolean) => void;
  setIsDeleteDialogOpen: (isOpen: boolean) => void;
  resetForm: () => void;
  setCurrentProfessional: (professional: Professional | null) => void;
  toast: ReturnType<typeof useToast>["toast"];
}

export const useProfessionalsCRUD = ({
  setIsDialogOpen,
  setIsDeleteDialogOpen,
  resetForm,
  setCurrentProfessional,
  toast,
}: UseProfessionalsCRUDProps) => {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();
  const { salon } = useAuth();
  const salonId = salon?.id;

  // Get all professionals for this salon
  const { refetch } = useQuery({
    queryKey: ["professionals", salonId],
    queryFn: async () => {
      if (!salonId) return [];
      
      const { data, error } = await supabase
        .from("profissionais")
        .select("*")
        .eq("salao_id", salonId)
        .order("nome");
        
      if (error) throw new Error(error.message);
      setProfessionals(data || []);
      setIsLoading(false);
      return data || [];
    },
    enabled: !!salonId,
  });

  // Create a new professional
  const createProfessionalMutation = useMutation({
    mutationFn: async (professionalData: Omit<Professional, "id" | "created_at">) => {
      if (!salonId) throw new Error("Salão não encontrado");
      
      const { data, error } = await supabase
        .from("profissionais")
        .insert({
          ...professionalData,
          salao_id: salonId,
        })
        .select();
        
      if (error) throw error;
      return data[0];
    },
    onSuccess: () => {
      toast({
        title: "Profissional criado",
        description: "O profissional foi cadastrado com sucesso",
      });
      
      resetForm();
      setIsDialogOpen(false);
      refetch();
    },
    onError: (error) => {
      console.error("Error creating professional:", error);
      toast({
        title: "Erro ao criar profissional",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update an existing professional
  const updateProfessionalMutation = useMutation({
    mutationFn: async ({
      id,
      professional,
    }: {
      id: string;
      professional: Partial<Professional>;
    }) => {
      if (!salonId) throw new Error("Salão não encontrado");
      
      const { data, error } = await supabase
        .from("profissionais")
        .update({
          ...professional,
          salao_id: salonId,
        })
        .eq("id", id)
        .select();
        
      if (error) throw error;
      return data[0];
    },
    onSuccess: () => {
      toast({
        title: "Profissional atualizado",
        description: "As informações foram atualizadas com sucesso",
      });
      
      resetForm();
      setIsDialogOpen(false);
      refetch();
    },
    onError: (error) => {
      console.error("Error updating professional:", error);
      toast({
        title: "Erro ao atualizar profissional",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete a professional
  const deleteProfessionalMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("profissionais")
        .delete()
        .eq("id", id);
        
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      toast({
        title: "Profissional removido",
        description: "O profissional foi removido com sucesso",
      });
      
      setCurrentProfessional(null);
      setIsDeleteDialogOpen(false);
      refetch();
    },
    onError: (error) => {
      console.error("Error deleting professional:", error);
      toast({
        title: "Erro ao remover profissional",
        description: error.message,
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
