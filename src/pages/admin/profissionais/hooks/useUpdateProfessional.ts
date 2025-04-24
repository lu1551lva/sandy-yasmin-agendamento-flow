
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Professional, supabase } from "@/lib/supabase";
import { UseToastReturn } from "@/hooks/use-toast";

interface UpdateProfessionalOptions {
  toast: UseToastReturn;
  setIsDialogOpen: (open: boolean) => void;
  resetForm: () => void;
  setCurrentProfessional: (p: Professional | null) => void;
  setIsLoading?: (loading: boolean) => void;
}

export function useUpdateProfessional({
  toast,
  setIsDialogOpen,
  resetForm,
  setCurrentProfessional,
  setIsLoading
}: UpdateProfessionalOptions) {
  const queryClient = useQueryClient();
  
  return useMutation({
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
        nome: professional.nome,
        dias_atendimento: dias_atendimento,
        horario_inicio: professional.horario_inicio,
        horario_fim: professional.horario_fim
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
}
