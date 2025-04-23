
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase, Professional } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

// Utility for simple error description
function errorToString(error: unknown) {
  return String(error instanceof Error ? error.message : "Erro desconhecido");
}

export function useProfessionalsCRUD({
  setIsDialogOpen,
  setIsDeleteDialogOpen,
  resetForm,
  setCurrentProfessional,
  toast,
}: {
  setIsDialogOpen: (v: boolean) => void;
  setIsDeleteDialogOpen: (v: boolean) => void;
  resetForm: () => void;
  setCurrentProfessional: (p: Professional | null) => void;
  toast: ReturnType<typeof useToast>["toast"];
}) {
  const queryClient = useQueryClient();

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
        .update({ ...professional })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error("Profissional não encontrada.");
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["professionals"] });
      toast({
        title: "Profissional atualizada",
        description: `Profissional ${data.nome} foi atualizada com sucesso.`,
      });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar profissional",
        description: errorToString(error),
        variant: "destructive",
      });
    },
  });

  const createProfessionalMutation = useMutation({
    mutationFn: async (professional: Omit<Professional, "id" | "created_at">) => {
      if (professional.nome.toLowerCase() === "sandy yasmin") {
        const { data: existingProfessional } = await supabase
          .from("profissionais")
          .select("*")
          .ilike("nome", "sandy yasmin")
          .maybeSingle();
        if (existingProfessional) {
          throw new Error("Sandy Yasmin já está cadastrada como profissional");
        }
      }
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
        title: "Profissional cadastrada",
        description: "A profissional foi adicionada com sucesso.",
      });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast({
        title: "Erro ao cadastrar profissional",
        description: errorToString(error),
        variant: "destructive",
      });
    },
  });

  const deleteProfessionalMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("profissionais").delete().eq("id", id);
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["professionals"] });
      toast({
        title: "Profissional excluída",
        description: "A profissional foi excluída com sucesso.",
      });
      setIsDeleteDialogOpen(false);
      setCurrentProfessional(null);
    },
    onError: (error) => {
      toast({
        title: "Erro ao excluir profissional",
        description: errorToString(error),
        variant: "destructive",
      });
    },
  });

  return {
    professionals,
    isLoading,
    updateProfessionalMutation,
    createProfessionalMutation,
    deleteProfessionalMutation,
  };
}
