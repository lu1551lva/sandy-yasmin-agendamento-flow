
import { useState } from "react";
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
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/utils";
import { Plus, Edit, Trash2 } from "lucide-react";
import ServiceForm from "./services/ServiceForm";

const Services = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentService, setCurrentService] = useState<Service | null>(null);

  // Fetch services
  const { data: services, isLoading } = useQuery({
    queryKey: ["services"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("servicos")
          .select("*")
          .order("nome");

        if (error) {
          toast({
            title: "Erro ao carregar serviços",
            description: error.message,
            variant: "destructive",
          });
          throw error;
        }
        return data as Service[];
      } catch (error: any) {
        console.error("Erro ao buscar serviços:", error);
        throw error;
      }
    },
  });

  // Create service mutation
  const createServiceMutation = useMutation({
    mutationFn: async (service: Omit<Service, "id" | "created_at">) => {
      try {
        const { data, error } = await supabase
          .from("servicos")
          .insert(service)
          .select()
          .single();

        if (error) {
          toast({
            title: "Erro ao cadastrar serviço",
            description: error.message,
            variant: "destructive",
          });
          throw error;
        }
        return data;
      } catch (error: any) {
        console.error("Erro ao criar serviço:", error);
        throw error;
      }
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
    mutationFn: async ({ id, service }: { id: string; service: Partial<Service>; }) => {
      try {
        const { data, error } = await supabase
          .from("servicos")
          .update(service)
          .eq("id", id)
          .select()
          .single();

        if (error) {
          toast({
            title: "Erro ao atualizar serviço",
            description: error.message,
            variant: "destructive",
          });
          throw error;
        }
        return data;
      } catch (error: any) {
        console.error("Erro ao atualizar serviço:", error);
        throw error;
      }
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
      try {
        const { error } = await supabase.from("servicos").delete().eq("id", id);

        if (error) {
          toast({
            title: "Erro ao excluir serviço",
            description: error.message,
            variant: "destructive",
          });
          throw error;
        }
        return id;
      } catch (error: any) {
        console.error("Erro ao excluir serviço:", error);
        throw error;
      }
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
  const handleSubmit = (formData: any) => {
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-semibold mb-2">Serviços</h1>
          <p className="text-muted-foreground">
            Gerencie os serviços oferecidos pelo salão
          </p>
        </div>
        <Button onClick={openNewServiceDialog} className="flex items-center gap-2 w-full sm:w-auto">
          <Plus className="h-4 w-4" /> Novo Serviço
        </Button>
      </div>

      <Card className="shadow-sm">
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
          <ServiceForm 
            isEditing={isEditing}
            currentService={currentService}
            onSubmit={handleSubmit}
            resetForm={resetForm}
          />
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
