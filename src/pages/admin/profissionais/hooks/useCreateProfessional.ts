
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Professional, supabase } from "@/lib/supabase";
import { UseToastReturn } from "@/hooks/use-toast";

interface CreateProfessionalOptions {
  toast: UseToastReturn;
  setIsDialogOpen: (open: boolean) => void;
  resetForm: () => void;
  setIsLoading?: (loading: boolean) => void;
}

export function useCreateProfessional({
  toast,
  setIsDialogOpen,
  resetForm,
  setIsLoading
}: CreateProfessionalOptions) {
  const queryClient = useQueryClient();
  
  return useMutation({
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
}
