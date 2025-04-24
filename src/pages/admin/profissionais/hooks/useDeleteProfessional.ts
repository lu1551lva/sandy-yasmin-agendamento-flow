
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { UseToastReturn } from "@/hooks/use-toast";

interface DeleteProfessionalOptions {
  toast: UseToastReturn;
  setIsDeleteDialogOpen: (open: boolean) => void;
  setCurrentProfessional: (p: null) => void;
}

export function useDeleteProfessional({
  toast,
  setIsDeleteDialogOpen,
  setCurrentProfessional
}: DeleteProfessionalOptions) {
  const queryClient = useQueryClient();
  
  return useMutation({
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
}
