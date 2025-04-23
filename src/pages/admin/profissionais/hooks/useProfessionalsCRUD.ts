import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase, Professional } from "@/lib/supabase";
import { useAuth } from "@/context/auth-context";

interface UseProfessionalsCRUDProps {
  setIsDialogOpen: (open: boolean) => void;
  setIsDeleteDialogOpen: (open: boolean) => void;
  resetForm: () => void;
  setCurrentProfessional: (professional: Professional | null) => void;
  toast: any;
}

export const useProfessionalsCRUD = ({
  setIsDialogOpen,
  setIsDeleteDialogOpen,
  resetForm,
  setCurrentProfessional,
  toast,
}: UseProfessionalsCRUDProps) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Get professionals
  const { data: professionals, isLoading } = useQuery({
    queryKey: ["professionals"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profissionais")
        .select("*")
        .order("nome");

      if (error) throw error;
      return data as Professional[];
    },
  });

  // Create professional
  const createProfessionalMutation = useMutation({
    mutationFn: async (professional: Omit<Professional, "id" | "created_at">) => {
      const { data, error } = await supabase
        .from("profissionais")
        .insert(professional)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["professionals"] });
      toast({
        title: "Profissional cadastrado com sucesso",
      });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao cadastrar profissional",
        description: error.message,
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
      const { data, error } = await supabase
        .from("profissionais")
        .update(professional)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["professionals"] });
      toast({
        title: "Profissional atualizado com sucesso",
      });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao atualizar profissional",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete professional
  const deleteProfessionalMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("profissionais").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["professionals"] });
      toast({
        title: "Profissional excluído com sucesso",
      });
      setIsDeleteDialogOpen(false);
      setCurrentProfessional(null);
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao excluir profissional",
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
