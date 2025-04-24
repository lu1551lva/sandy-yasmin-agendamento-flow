import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase, Professional } from "@/lib/supabase";
import { UseToastReturn } from "@/hooks/use-toast";

interface UseProfessionalCRUDProps {
  setIsDialogOpen: (open: boolean) => void;
  setIsDeleteDialogOpen: (open: boolean) => void;
  resetForm: () => void;
  setCurrentProfessional: (p: Professional | null) => void;
  toast: UseToastReturn;
  setIsLoading?: (loading: boolean) => void;
}

export function useProfessionalsCRUD({
  setIsDialogOpen,
  setIsDeleteDialogOpen,
  resetForm,
  setCurrentProfessional,
  toast,
  setIsLoading
}: UseProfessionalCRUDProps) {
  const queryClient = useQueryClient();

  // Buscar todos os profissionais
  const { data: professionals, isLoading } = useQuery({
    queryKey: ["professionals"],
    queryFn: async () => {
      console.log("Buscando profissionais...");
      const { data, error } = await supabase
        .from("profissionais")
        .select("*")
        .order("nome");
        
      if (error) {
        console.error("Erro ao buscar profissionais:", error);
        throw error;
      }
      
      console.log("Profissionais encontrados:", data);
      return data as Professional[];
    },
  });

  // Criar profissional
  const createProfessionalMutation = useMutation({
    mutationFn: async (professional: Omit<Professional, "id" | "created_at">) => {
      console.log("Criando novo profissional com dados:", professional);
      
      // Garantir que dias_atendimento seja um array
      const dias_atendimento = Array.isArray(professional.dias_atendimento) 
        ? professional.dias_atendimento 
        : [];
      
      const { data, error } = await supabase
        .from("profissionais")
        .insert({
          ...professional,
          dias_atendimento: dias_atendimento
        })
        .select()
        .single();

      if (error) {
        console.error("Erro ao criar profissional:", error);
        throw error;
      }
      
      console.log("Profissional criado com sucesso:", data);
      return data;
    },
    onSuccess: () => {
      console.log("Mutação de criação bem sucedida");
      queryClient.invalidateQueries({ queryKey: ["professionals"] });
      toast.toast({
        title: "Profissional cadastrado com sucesso",
      });
      setIsDialogOpen(false);
      resetForm();
      if (setIsLoading) setIsLoading(false);
    },
    onError: (error: any) => {
      console.error("Erro na mutação de criação:", error);
      let errorMessage = "Ocorreu um erro ao cadastrar o profissional";
      
      if (error?.message) {
        errorMessage = error.message;
      } else if (typeof error === 'object') {
        try {
          errorMessage = JSON.stringify(error);
        } catch (e) {
          errorMessage = "Erro desconhecido ao cadastrar profissional";
        }
      }
      
      toast.toast({
        title: "Erro ao cadastrar profissional",
        description: errorMessage,
        variant: "destructive",
      });
      if (setIsLoading) setIsLoading(false);
    },
  });

  // Atualizar profissional
  const updateProfessionalMutation = useMutation({
    mutationFn: async ({
      id,
      professional,
    }: {
      id: string;
      professional: Partial<Omit<Professional, "id" | "created_at">>;
    }) => {
      console.log("Atualizando profissional:", id);
      console.log("Com os dados:", professional);
      
      // Garantir que dias_atendimento seja um array
      const dias_atendimento = Array.isArray(professional.dias_atendimento) 
        ? professional.dias_atendimento 
        : [];
        
      const updateData = {
        ...professional,
        dias_atendimento: dias_atendimento
      };
      
      console.log("Dados formatados para atualização:", updateData);
      
      const { data, error } = await supabase
        .from("profissionais")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("Erro ao atualizar profissional:", error);
        throw error;
      }
      
      console.log("Profissional atualizado com sucesso:", data);
      return data;
    },
    onSuccess: () => {
      console.log("Mutação de atualização bem sucedida");
      queryClient.invalidateQueries({ queryKey: ["professionals"] });
      toast.toast({
        title: "Profissional atualizado com sucesso",
      });
      setIsDialogOpen(false);
      resetForm();
      setCurrentProfessional(null);
      if (setIsLoading) setIsLoading(false);
    },
    onError: (error: any) => {
      console.error("Erro na mutação de atualização:", error);
      let errorMessage = "Ocorreu um erro ao atualizar o profissional";
      
      if (error?.message) {
        errorMessage = error.message;
      } else if (typeof error === 'object') {
        try {
          errorMessage = JSON.stringify(error);
        } catch (e) {
          errorMessage = "Erro desconhecido ao atualizar profissional";
        }
      }
      
      toast.toast({
        title: "Erro ao atualizar profissional",
        description: errorMessage,
        variant: "destructive",
      });
      if (setIsLoading) setIsLoading(false);
    },
  });

  // Deletar profissional
  const deleteProfessionalMutation = useMutation({
    mutationFn: async (id: string) => {
      console.log("Deletando profissional:", id);
      const { error } = await supabase.from("profissionais").delete().eq("id", id);
      
      if (error) {
        console.error("Erro ao deletar profissional:", error);
        throw error;
      }
      
      console.log("Profissional deletado com sucesso");
      return id;
    },
    onSuccess: () => {
      console.log("Mutação de exclusão bem sucedida");
      queryClient.invalidateQueries({ queryKey: ["professionals"] });
      toast.toast({
        title: "Profissional excluído com sucesso",
      });
      setIsDeleteDialogOpen(false);
      setCurrentProfessional(null);
    },
    onError: (error: any) => {
      console.error("Erro na mutação de exclusão:", error);
      let errorMessage = "Ocorreu um erro ao excluir o profissional";
      
      if (error?.message) {
        errorMessage = error.message;
      } else if (typeof error === 'object') {
        try {
          errorMessage = JSON.stringify(error);
        } catch (e) {
          errorMessage = "Erro desconhecido ao excluir profissional";
        }
      }
      
      toast.toast({
        title: "Erro ao excluir profissional",
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
