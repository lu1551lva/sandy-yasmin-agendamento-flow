
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Block } from "../types";

export function useBlocks() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: blocks = [], isLoading } = useQuery({
    queryKey: ["blocks"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bloqueios")
        .select("*")
        .order("data_inicio", { ascending: true });

      if (error) {
        toast({
          title: "Erro ao carregar bloqueios",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }

      return data as Block[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (blockData: Omit<Block, "id" | "created_at">) => {
      const { error } = await supabase.from("bloqueios").insert([blockData]);
      
      if (error) {
        toast({
          title: "Erro ao criar bloqueio",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }

      toast({
        title: "Bloqueio criado com sucesso",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blocks"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...blockData }: Partial<Block> & { id: string }) => {
      const { error } = await supabase
        .from("bloqueios")
        .update(blockData)
        .eq("id", id);

      if (error) {
        toast({
          title: "Erro ao atualizar bloqueio",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }

      toast({
        title: "Bloqueio atualizado com sucesso",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blocks"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("bloqueios").delete().eq("id", id);

      if (error) {
        toast({
          title: "Erro ao excluir bloqueio",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }

      toast({
        title: "Bloqueio excluído com sucesso",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blocks"] });
    },
  });

  return {
    blocks,
    isLoading,
    createBlock: createMutation.mutateAsync,
    updateBlock: updateMutation.mutateAsync,
    deleteBlock: deleteMutation.mutateAsync,
  };
}
