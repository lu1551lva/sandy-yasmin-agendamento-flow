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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2 } from "lucide-react";

const DIAS_SEMANA = [
  { id: "domingo", label: "Domingo" },
  { id: "segunda", label: "Segunda-feira" },
  { id: "terca", label: "Terça-feira" },
  { id: "quarta", label: "Quarta-feira" },
  { id: "quinta", label: "Quinta-feira" },
  { id: "sexta", label: "Sexta-feira" },
  { id: "sabado", label: "Sábado" },
];

const HORARIOS = Array.from({ length: 25 }, (_, i) => {
  const hour = String(i).padStart(2, "0");
  return `${hour}:00`;
});

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

  // Fetch professionals
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

  // Create professional mutation
  const createProfessionalMutation = useMutation({
    mutationFn: async (professional: Omit<Professional, "id" | "created_at">) => {
      // Check if Sandy Yasmin is already added
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

  // Update professional mutation
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
        .update(professional)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["professionals"] });
      toast({
        title: "Profissional atualizada",
        description: "A profissional foi atualizada com sucesso.",
      });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar profissional",
        description: String(error),
        variant: "destructive",
      });
    },
  });

  // Delete professional mutation
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

  // Handle form submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
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

    // Ensure end time is later than start time
    const startHour = parseInt(formData.horario_inicio.split(":")[0]);
    const endHour = parseInt(formData.horario_fim.split(":")[0]);
    
    if (endHour <= startHour) {
      newErrors.horario_fim = "O horário de fim deve ser maior que o horário de início";
    }
    
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length > 0) {
      return;
    }
    
    // Prepare professional data
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

  // Handle edit professional
  const handleEdit = (professional: Professional) => {
    setCurrentProfessional(professional);
    setFormData({
      nome: professional.nome,
      dias_atendimento: professional.dias_atendimento,
      horario_inicio: professional.horario_inicio,
      horario_fim: professional.horario_fim,
    });
    setIsEditing(true);
    setIsDialogOpen(true);
  };

  // Handle delete professional
  const handleDelete = (professional: Professional) => {
    setCurrentProfessional(professional);
    setIsDeleteDialogOpen(true);
  };

  // Reset form
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

  // Toggle day selection
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

  // Open dialog for new professional
  const openNewProfessionalDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  // Helper to format working days
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
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : professionals && professionals.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Dias de Atendimento</TableHead>
                    <TableHead>Horários</TableHead>
                    <TableHead className="w-[100px]">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {professionals.map((professional) => (
                    <TableRow key={professional.id}>
                      <TableCell className="font-medium">
                        {professional.nome}
                      </TableCell>
                      <TableCell>
                        {formatDiasAtendimento(professional.dias_atendimento)}
                      </TableCell>
                      <TableCell>
                        {professional.horario_inicio} às {professional.horario_fim}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleEdit(professional)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleDelete(professional)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">
                Não há profissionais cadastradas.
              </p>
              <Button onClick={openNewProfessionalDialog}>
                Adicionar Profissional
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog for adding/editing professional */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Editar Profissional" : "Nova Profissional"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome da Profissional</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                placeholder="Ex: Sandy Yasmin"
                className={errors.nome ? "border-red-500" : ""}
              />
              {errors.nome && (
                <p className="text-red-500 text-sm">{errors.nome}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Dias de Atendimento</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {DIAS_SEMANA.map((dia) => (
                  <div key={dia.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`dia-${dia.id}`}
                      checked={formData.dias_atendimento.includes(dia.id)}
                      onCheckedChange={() => toggleDay(dia.id)}
                    />
                    <label
                      htmlFor={`dia-${dia.id}`}
                      className="text-sm cursor-pointer"
                    >
                      {dia.label}
                    </label>
                  </div>
                ))}
              </div>
              {errors.dias_atendimento && (
                <p className="text-red-500 text-sm">{errors.dias_atendimento}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="horario_inicio">Horário de Início</Label>
                <Select
                  value={formData.horario_inicio}
                  onValueChange={(value) =>
                    setFormData({ ...formData, horario_inicio: value })
                  }
                >
                  <SelectTrigger
                    id="horario_inicio"
                    className={errors.horario_inicio ? "border-red-500" : ""}
                  >
                    <SelectValue placeholder="Selecione o horário" />
                  </SelectTrigger>
                  <SelectContent>
                    {HORARIOS.filter((h) => {
                      const hour = parseInt(h.split(":")[0]);
                      return hour < 18; // Only show hours before 18:00 for start time
                    }).map((hora) => (
                      <SelectItem key={`inicio-${hora}`} value={hora}>
                        {hora}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.horario_inicio && (
                  <p className="text-red-500 text-sm">{errors.horario_inicio}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="horario_fim">Horário de Término</Label>
                <Select
                  value={formData.horario_fim}
                  onValueChange={(value) =>
                    setFormData({ ...formData, horario_fim: value })
                  }
                >
                  <SelectTrigger
                    id="horario_fim"
                    className={errors.horario_fim ? "border-red-500" : ""}
                  >
                    <SelectValue placeholder="Selecione o horário" />
                  </SelectTrigger>
                  <SelectContent>
                    {HORARIOS.filter((h) => {
                      const hour = parseInt(h.split(":")[0]);
                      const startHour = parseInt(formData.horario_inicio.split(":")[0]);
                      return hour > startHour; // Only show hours after start time
                    }).map((hora) => (
                      <SelectItem key={`fim-${hora}`} value={hora}>
                        {hora}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.horario_fim && (
                  <p className="text-red-500 text-sm">{errors.horario_fim}</p>
                )}
              </div>
            </div>

            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancelar
                </Button>
              </DialogClose>
              <Button type="submit">
                {isEditing ? "Atualizar" : "Cadastrar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Confirmation dialog for deleting professional */}
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
