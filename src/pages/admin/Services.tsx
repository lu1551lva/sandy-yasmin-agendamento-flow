
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase, Service } from "@/lib/supabase";
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
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/utils";
import { Plus, Edit, Trash2 } from "lucide-react";

const Services = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentService, setCurrentService] = useState<Service | null>(null);
  const [formData, setFormData] = useState({
    nome: "",
    valor: "",
    duracao_em_minutos: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch services
  const { data: services, isLoading } = useQuery({
    queryKey: ["services"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("servicos")
        .select("*")
        .order("nome");

      if (error) throw error;
      return data as Service[];
    },
  });

  // Create service mutation
  const createServiceMutation = useMutation({
    mutationFn: async (service: Omit<Service, "id" | "created_at">) => {
      const { data, error } = await supabase
        .from("servicos")
        .insert(service)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
      toast({
        title: "Serviço cadastrado",
        description: "O serviço foi adicionado com sucesso.",
      });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast({
        title: "Erro ao cadastrar serviço",
        description: String(error),
        variant: "destructive",
      });
    },
  });

  // Update service mutation
  const updateServiceMutation = useMutation({
    mutationFn: async ({
      id,
      service,
    }: {
      id: string;
      service: Partial<Service>;
    }) => {
      const { data, error } = await supabase
        .from("servicos")
        .update(service)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
      toast({
        title: "Serviço atualizado",
        description: "O serviço foi atualizado com sucesso.",
      });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar serviço",
        description: String(error),
        variant: "destructive",
      });
    },
  });

  // Delete service mutation
  const deleteServiceMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("servicos").delete().eq("id", id);

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
      toast({
        title: "Serviço excluído",
        description: "O serviço foi excluído com sucesso.",
      });
      setIsDeleteDialogOpen(false);
      setCurrentService(null);
    },
    onError: (error) => {
      toast({
        title: "Erro ao excluir serviço",
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
      newErrors.nome = "O nome do serviço é obrigatório";
    }
    
    if (!formData.valor.trim()) {
      newErrors.valor = "O valor do serviço é obrigatório";
    } else if (isNaN(Number(formData.valor.replace(",", ".")))) {
      newErrors.valor = "O valor deve ser um número válido";
    }
    
    if (!formData.duracao_em_minutos.trim()) {
      newErrors.duracao_em_minutos = "A duração do serviço é obrigatória";
    } else if (
      isNaN(Number(formData.duracao_em_minutos)) || 
      Number(formData.duracao_em_minutos) <= 0
    ) {
      newErrors.duracao_em_minutos = "A duração deve ser um número válido maior que zero";
    }
    
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length > 0) {
      return;
    }
    
    // Prepare service data
    const serviceData = {
      nome: formData.nome,
      valor: Number(formData.valor.replace(",", ".")),
      duracao_em_minutos: Number(formData.duracao_em_minutos),
    };
    
    if (isEditing && currentService) {
      updateServiceMutation.mutate({
        id: currentService.id,
        service: serviceData,
      });
    } else {
      createServiceMutation.mutate(serviceData);
    }
  };

  // Handle edit service
  const handleEdit = (service: Service) => {
    setCurrentService(service);
    setFormData({
      nome: service.nome,
      valor: String(service.valor),
      duracao_em_minutos: String(service.duracao_em_minutos),
    });
    setIsEditing(true);
    setIsDialogOpen(true);
  };

  // Handle delete service
  const handleDelete = (service: Service) => {
    setCurrentService(service);
    setIsDeleteDialogOpen(true);
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      nome: "",
      valor: "",
      duracao_em_minutos: "",
    });
    setErrors({});
    setIsEditing(false);
    setCurrentService(null);
  };

  // Open dialog for new service
  const openNewServiceDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-semibold mb-2">Serviços</h1>
          <p className="text-muted-foreground">
            Gerencie os serviços oferecidos pelo salão
          </p>
        </div>
        <Button onClick={openNewServiceDialog} className="flex items-center gap-2">
          <Plus className="h-4 w-4" /> Novo Serviço
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Gerenciamento de Serviços</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : services && services.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Duração</TableHead>
                    <TableHead className="w-[100px]">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {services.map((service) => (
                    <TableRow key={service.id}>
                      <TableCell className="font-medium">{service.nome}</TableCell>
                      <TableCell>{formatCurrency(service.valor)}</TableCell>
                      <TableCell>{service.duracao_em_minutos} minutos</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleEdit(service)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleDelete(service)}
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
                Não há serviços cadastrados.
              </p>
              <Button onClick={openNewServiceDialog}>Adicionar Serviço</Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog for adding/editing service */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Editar Serviço" : "Novo Serviço"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome do Serviço</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                placeholder="Ex: Design de Sobrancelha"
                className={errors.nome ? "border-red-500" : ""}
              />
              {errors.nome && (
                <p className="text-red-500 text-sm">{errors.nome}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="valor">Valor (R$)</Label>
              <Input
                id="valor"
                value={formData.valor}
                onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
                placeholder="Ex: 40.00"
                className={errors.valor ? "border-red-500" : ""}
              />
              {errors.valor && (
                <p className="text-red-500 text-sm">{errors.valor}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="duracao">Duração (minutos)</Label>
              <Input
                id="duracao"
                value={formData.duracao_em_minutos}
                onChange={(e) =>
                  setFormData({ ...formData, duracao_em_minutos: e.target.value })
                }
                placeholder="Ex: 30"
                className={errors.duracao_em_minutos ? "border-red-500" : ""}
              />
              {errors.duracao_em_minutos && (
                <p className="text-red-500 text-sm">{errors.duracao_em_minutos}</p>
              )}
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

      {/* Confirmation dialog for deleting service */}
      <AlertDialog 
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Serviço</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o serviço{" "}
              <strong>{currentService?.nome}</strong>? Esta ação não pode ser
              desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setCurrentService(null)}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (currentService) {
                  deleteServiceMutation.mutate(currentService.id);
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

export default Services;
