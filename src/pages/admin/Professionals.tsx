
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase, Professional } from "@/lib/supabase";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus } from "lucide-react";
import ProfessionalForm from "./components/ProfessionalForm";
import ProfessionalTable from "./components/ProfessionalTable";

const DIAS_SEMANA = [
  { id: "domingo", label: "Domingo" },
  { id: "segunda", label: "Segunda-feira" },
  { id: "terca", label: "Terça-feira" },
  { id: "quarta", label: "Quarta-feira" },
  { id: "quinta", label: "Quinta-feira" },
  { id: "sexta", label: "Sexta-feira" },
  { id: "sabado", label: "Sábado" },
];

const Professionals = () => {
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

  const updateProfessionalMutation = useMutation({
    mutationFn: async ({
      id,
      professional,
    }: {
      id: string;
      professional: Partial<Professional>;
    }) => {
      try {
        // Corrigindo a mutação update de profissional para rastrear melhor os erros
        console.log("Atualizando profissional:", id, professional);
        
        const { data, error } = await supabase
          .from("profissionais")
          .update(professional)
          .eq("id", id)
          .select();
        
        if (error) {
          console.error("Erro na atualização:", error);
          throw error;
        }
        
        if (!data || data.length === 0) {
          throw new Error("Profissional não encontrado ou nenhuma modificação feita");
        }
        
        return data[0];
      } catch (error: any) {
        console.error("Erro completo na atualização:", error);
        throw new Error(error.message || "Erro ao atualizar profissional");
      }
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
      console.error("Erro na mutation:", error);
      toast({
        title: "Erro ao atualizar profissional",
        description: String(error instanceof Error ? error.message : "Erro desconhecido"),
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
        description: String(error),
        variant: "destructive",
      });
    },
  });

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
    
    if (Object.keys(newErrors).length > 0) {
      return;
    }
    
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

  const formatDiasAtendimento = (dias: string[]) => {
    if (dias.length === 0) return "Sem dias definidos";
    if (dias.length === 7) return "Todos os dias";
    
    const diasMap: Record<string, string> = {
      segunda: "Seg",
      terca: "Ter",
      quarta: "Qua",
      quinta: "Qui",
      sexta: "Sex",
      sabado: "Sáb",
      domingo: "Dom",
    };
    
    return dias.map((dia) => diasMap[dia]).join(", ");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-semibold mb-2">Profissionais</h1>
          <p className="text-muted-foreground">
            Gerencie os profissionais do salão
          </p>
        </div>
        <Button onClick={openNewProfessionalDialog} className="flex items-center gap-2">
          <Plus className="h-4 w-4" /> Nova Profissional
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Gerenciamento de Profissionais</CardTitle>
        </CardHeader>
        <CardContent>
          <ProfessionalTable
            professionals={professionals || []}
            isLoading={isLoading}
            onEdit={handleEdit}
            onDelete={handleDelete}
            formatDiasAtendimento={formatDiasAtendimento}
            onAddProfessional={openNewProfessionalDialog}
          />
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <ProfessionalForm
          formData={formData}
          errors={errors}
          isEditing={isEditing}
          onInputChange={(field, value) => setFormData(prev => ({
            ...prev, [field]: value,
          }))}
          onToggleDay={toggleDay}
          onSubmit={handleSubmit}
          onReset={resetForm}
        />
      </Dialog>

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Profissional</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a profissional{" "}
              <strong>{currentProfessional?.nome}</strong>? Esta ação não pode ser
              desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setCurrentProfessional(null)}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (currentProfessional) {
                  deleteProfessionalMutation.mutate(currentProfessional.id);
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Professionals;
