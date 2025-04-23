
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase, Professional } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

export const useProfessionals = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentProfessional, setCurrentProfessional] = useState<Professional | null>(null);
  const [formData, setFormData] = useState({
    nome: "",
    dias_atendimento: [] as string[],
    horario_inicio: "08:00",
    horario_fim: "18:00",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

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

  // Corrigido para update funcionar corretamente
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
        .update({
          ...professional,
          // Remover undefined para não enviar campos não editados
          dias_atendimento: professional.dias_atendimento,
          horario_inicio: professional.horario_inicio,
          horario_fim: professional.horario_fim,
          nome: professional.nome,
        })
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
        description: String(error instanceof Error ? error.message : "Erro desconhecido"),
        variant: "destructive",
      });
    },
  });

  // Criar profissional
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
        description: String(error),
        variant: "destructive",
      });
    },
  });

  // Excluir profissional
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
        description: String(error),
        variant: "destructive",
      });
    },
  });

  // Funções auxiliares
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};
    if (!formData.nome.trim()) {
      newErrors.nome = "O nome da profissional é obrigatório";
    }
    if (formData.dias_atendimento.length === 0) {
      newErrors.dias_atendimento = "Selecione pelo menos um dia de atendimento";
    }
    if (!formData.horario_inicio) {
      newErrors.horario_inicio = "O horário de início é obrigatório";
    }
    if (!formData.horario_fim) {
      newErrors.horario_fim = "O horário de fim é obrigatório";
    }
    const startHour = parseInt(formData.horario_inicio.split(":")[0]);
    const endHour = parseInt(formData.horario_fim.split(":")[0]);
    if (endHour <= startHour) {
      newErrors.horario_fim = "O horário de fim deve ser maior que o horário de início";
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    const professionalData = {
      nome: formData.nome,
      dias_atendimento: formData.dias_atendimento,
      horario_inicio: formData.horario_inicio,
      horario_fim: formData.horario_fim,
    };

    if (isEditing && currentProfessional) {
      updateProfessionalMutation.mutate({
        id: currentProfessional.id,
        professional: professionalData,
      });
    } else {
      createProfessionalMutation.mutate(professionalData);
    }
  };

  const handleEdit = (professional: Professional) => {
    setCurrentProfessional(professional);
    setFormData({
      nome: professional.nome,
      dias_atendimento: professional.dias_atendimento || [],
      horario_inicio: professional.horario_inicio,
      horario_fim: professional.horario_fim,
    });
    setIsEditing(true);
    setIsDialogOpen(true);
  };

  const handleDelete = (professional: Professional) => {
    setCurrentProfessional(professional);
    setIsDeleteDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      nome: "",
      dias_atendimento: [],
      horario_inicio: "08:00",
      horario_fim: "18:00",
    });
    setErrors({});
    setIsEditing(false);
    setCurrentProfessional(null);
  };

  const toggleDay = (day: string) => {
    setFormData((prev) => {
      const days = [...prev.dias_atendimento];
      if (days.includes(day)) {
        return {
          ...prev,
          dias_atendimento: days.filter((d) => d !== day),
        };
      } else {
        return {
          ...prev,
          dias_atendimento: [...days, day],
        };
      }
    });
  };

  const openNewProfessionalDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  return {
    professionals,
    isLoading,
    isDialogOpen,
    setIsDialogOpen,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    isEditing,
    setIsEditing,
    currentProfessional,
    setCurrentProfessional,
    formData,
    setFormData,
    errors,
    setErrors,
    handleSubmit,
    handleEdit,
    handleDelete,
    resetForm,
    toggleDay,
    openNewProfessionalDialog,
    deleteProfessionalMutation,
    createProfessionalMutation,
    updateProfessionalMutation,
  };
};
