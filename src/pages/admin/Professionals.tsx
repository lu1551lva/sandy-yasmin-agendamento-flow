
import { Plus } from "lucide-react";
import ProfessionalTable from "./components/ProfessionalTable";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase, Professional } from "@/lib/supabase";
import React, { useState, useEffect } from "react";
import ProfessionalFormDialog from "./profissionais/ProfessionalFormDialog";
import ProfessionalDeleteDialog from "./profissionais/ProfessionalDeleteDialog";
import { Button } from "@/components/ui/button";
import { useProfessionalForm } from "./profissionais/hooks/useProfessionalForm";

// Função utilitária para obter o salão autenticado pelo localStorage (ou contexto futuramente)
function getAuthSalao() {
  const raw = localStorage.getItem("salaoAuth");
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

const Professionals = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [professionalToDelete, setProfessionalToDelete] = useState<Professional | null>(null);
  const [salaoId, setSalaoId] = useState<string | null>(null);

  // Busca o salao_id autenticado ao montar o componente
  useEffect(() => {
    const salao = getAuthSalao();
    setSalaoId(salao?.id || null);
  }, []);

  // Buscar profissionais do salão autenticado
  const { data: professionals, isLoading } = useQuery({
    enabled: !!salaoId,
    queryKey: ["professionals", salaoId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profissionais")
        .select("*")
        .eq("salao_id", salaoId);
      if (error) throw error;
      return data as Professional[];
    },
  });

  const createProfessionalMutation = useMutation({
    mutationFn: async (data: Omit<Professional, "id" | "created_at">) => {
      if (!salaoId) throw new Error("Salão não autenticado");
      const { data: result, error } = await supabase
        .from("profissionais")
        .insert({ ...data, salao_id: salaoId })
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["professionals", salaoId] });
      toast({ title: "Profissional cadastrada" });
    },
    onError: (error) => {
      toast({
        title: "Erro ao cadastrar",
        description: String(error),
        variant: "destructive",
      });
    },
  });

  const updateProfessionalMutation = useMutation({
    mutationFn: async ({ id, ...data }: Partial<Professional> & { id: string }) => {
      if (!salaoId) throw new Error("Salão não autenticado");
      const { data: result, error } = await supabase
        .from("profissionais")
        .update({ ...data, salao_id: salaoId })
        .eq("id", id)
        .eq("salao_id", salaoId)
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["professionals", salaoId] });
      toast({ title: "Profissional atualizada" });
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar",
        description: String(error),
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!salaoId) throw new Error("Salão não autenticado");
      const { error } = await supabase.from("profissionais").delete()
        .eq("id", id).eq("salao_id", salaoId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["professionals", salaoId] });
      toast({ title: "Profissional excluída" });
      setDeleteOpen(false);
      setProfessionalToDelete(null);
    },
    onError: (error) => {
      toast({
        title: "Erro ao excluir",
        description: String(error),
        variant: "destructive",
      });
    },
  });

  const professionalForm = useProfessionalForm(
    (data, idEdit) => {
      if (idEdit) {
        updateProfessionalMutation.mutate({ id: idEdit, ...data });
      } else {
        createProfessionalMutation.mutate(data);
      }
    },
    () => {}
  );

  function handleDelete(prof: Professional) {
    setProfessionalToDelete(prof);
    setDeleteOpen(true);
  }

  // Função para exibir abreviatura dos dias de atendimento
  const formatDiasAtendimento = (dias: string[]) => {
    const abrev: Record<string, string> = {
      segunda: "Seg",
      terca: "Ter",
      quarta: "Qua",
      quinta: "Qui",
      sexta: "Sex",
      sabado: "Sáb",
      domingo: "Dom",
    };
    if (!dias || dias.length === 0) return "Sem dias definidos";
    if (dias.length === 7) return "Todos os dias";
    return dias.map((dia) => abrev[dia] || dia).join(", ");
  };

  // Bloquear uso se trial expirou (exemplo, pode sofisticar depois)
  if (!salaoId) {
    return <div className="text-center mt-10 text-destructive">Acesso negado. Faça login novamente.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-y-4">
        <div>
          <h1 className="text-3xl font-semibold mb-2">Profissionais</h1>
          <p className="text-muted-foreground">
            Gerencie os profissionais do salão
          </p>
        </div>
        <Button onClick={professionalForm.openForCreate} className="flex items-center gap-2">
          <Plus className="h-4 w-4" /> Nova Profissional
        </Button>
      </div>
      <div className="bg-white rounded-lg shadow">
        <ProfessionalTable
          professionals={professionals || []}
          isLoading={isLoading}
          onEdit={p => professionalForm.openForEdit(p)}
          onDelete={handleDelete}
          formatDiasAtendimento={formatDiasAtendimento}
          onAddProfessional={professionalForm.openForCreate}
        />
      </div>

      <ProfessionalFormDialog
        open={professionalForm.open}
        isEditing={!!professionalForm.editingId}
        form={professionalForm.form}
        errors={professionalForm.errors}
        onChange={professionalForm.handleChange}
        onToggleDay={professionalForm.toggleDay}
        onClose={professionalForm.closeDialog}
        onSubmit={professionalForm.handleSubmit}
      />

      <ProfessionalDeleteDialog
        open={deleteOpen}
        professional={professionalToDelete}
        onCancel={() => setDeleteOpen(false)}
        onDelete={() => {
          if (professionalToDelete) {
            deleteMutation.mutate(professionalToDelete.id);
          }
        }}
      />
    </div>
  );
};

export default Professionals;
