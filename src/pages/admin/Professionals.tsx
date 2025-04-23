
import { Plus } from "lucide-react";
import ProfessionalTable from "./components/ProfessionalTable";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase, Professional } from "@/lib/supabase";
import React, { useState } from "react";
import ProfessionalFormDialog from "./profissionais/ProfessionalFormDialog";
import ProfessionalDeleteDialog from "./profissionais/ProfessionalDeleteDialog";
import { Button } from "@/components/ui/button";
import { useProfessionalForm } from "./profissionais/hooks/useProfessionalForm";

const Professionals = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [professionalToDelete, setProfessionalToDelete] = useState<Professional | null>(null);

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

  const createProfessionalMutation = useMutation({
    mutationFn: async (data: Omit<Professional, "id" | "created_at">) => {
      const { data: result, error } = await supabase
        .from("profissionais")
        .insert(data)
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["professionals"] });
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
      const { data: result, error } = await supabase
        .from("profissionais")
        .update(data)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["professionals"] });
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
      const { error } = await supabase.from("profissionais").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["professionals"] });
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
    () => {
      /* onCancel - nothing extra for now */
    }
  );

  function handleDelete(prof: Professional) {
    setProfessionalToDelete(prof);
    setDeleteOpen(true);
  }

  // Formatação dos dias de atendimento (exemplo simples)
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
