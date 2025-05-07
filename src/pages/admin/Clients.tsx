
import { useEffect, useState } from "react";
import { Plus, Search, Edit, Trash2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { IconButton } from "@/components/ui/icon-button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ClientForm } from "@/components/admin/clients/ClientForm";
import { ClientDetailsDialog } from "@/components/admin/clients/ClientDetailsDialog";
import { supabase } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";

interface Cliente {
  id: string;
  nome: string;
  telefone: string;
  email: string;
  created_at: string;
}

const Clients = () => {
  const [clients, setClients] = useState<Cliente[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Cliente | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  // Fetch clients
  const fetchClients = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .order('nome');
        
      if (error) throw error;
      
      setClients(data || []);
    } catch (error: any) {
      console.error('Error fetching clients:', error);
      toast({
        title: "Erro ao carregar clientes",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchClients();
  }, []);

  // Handle search
  const filteredClients = clients.filter(client => 
    client.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.telefone.includes(searchTerm)
  );

  // Create client
  const handleCreateClient = async (clientData: Omit<Cliente, 'id' | 'created_at'>) => {
    try {
      const { data, error } = await supabase
        .from('clientes')
        .insert(clientData)
        .select()
        .single();
        
      if (error) throw error;
      
      setClients(prev => [...prev, data]);
      toast({
        title: "Cliente adicionado",
        description: "O cliente foi adicionado com sucesso."
      });
      setIsAddDialogOpen(false);
    } catch (error: any) {
      console.error('Error creating client:', error);
      toast({
        title: "Erro ao adicionar cliente",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Update client
  const handleUpdateClient = async (id: string, clientData: Omit<Cliente, 'id' | 'created_at'>) => {
    try {
      const { data, error } = await supabase
        .from('clientes')
        .update(clientData)
        .eq('id', id)
        .select()
        .single();
        
      if (error) throw error;
      
      setClients(prev => prev.map(client => client.id === id ? data : client));
      toast({
        title: "Cliente atualizado",
        description: "As informações do cliente foram atualizadas com sucesso."
      });
      setIsEditDialogOpen(false);
    } catch (error: any) {
      console.error('Error updating client:', error);
      toast({
        title: "Erro ao atualizar cliente",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Delete client
  const handleDeleteClient = async () => {
    if (!selectedClient) return;
    
    try {
      const { error } = await supabase
        .from('clientes')
        .delete()
        .eq('id', selectedClient.id);
        
      if (error) throw error;
      
      setClients(prev => prev.filter(client => client.id !== selectedClient.id));
      toast({
        title: "Cliente removido",
        description: "O cliente foi removido com sucesso."
      });
      setIsDeleteDialogOpen(false);
    } catch (error: any) {
      console.error('Error deleting client:', error);
      toast({
        title: "Erro ao remover cliente",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Clientes</h1>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" /> Novo Cliente
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xl">Lista de Clientes</CardTitle>
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar clientes..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-4">
                    Carregando clientes...
                  </TableCell>
                </TableRow>
              ) : filteredClients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-4">
                    {searchTerm ? "Nenhum cliente encontrado" : "Nenhum cliente cadastrado"}
                  </TableCell>
                </TableRow>
              ) : (
                filteredClients.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell>{client.nome}</TableCell>
                    <TableCell>{client.telefone}</TableCell>
                    <TableCell>{client.email}</TableCell>
                    <TableCell className="text-right space-x-1">
                      <IconButton 
                        icon={Eye} 
                        variant="ghost" 
                        onClick={() => {
                          setSelectedClient(client);
                          setIsDetailsDialogOpen(true);
                        }}
                        aria-label="Detalhes"
                      />
                      <IconButton 
                        icon={Edit} 
                        variant="ghost" 
                        onClick={() => {
                          setSelectedClient(client);
                          setIsEditDialogOpen(true);
                        }}
                        aria-label="Editar"
                      />
                      <IconButton 
                        icon={Trash2} 
                        variant="ghost" 
                        onClick={() => {
                          setSelectedClient(client);
                          setIsDeleteDialogOpen(true);
                        }}
                        aria-label="Excluir"
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add Client Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Cliente</DialogTitle>
          </DialogHeader>
          <ClientForm onSubmit={handleCreateClient} />
        </DialogContent>
      </Dialog>

      {/* Edit Client Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Cliente</DialogTitle>
          </DialogHeader>
          {selectedClient && (
            <ClientForm 
              onSubmit={(data) => handleUpdateClient(selectedClient.id, data)} 
              defaultValues={{
                nome: selectedClient.nome,
                telefone: selectedClient.telefone,
                email: selectedClient.email
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* View Client Details Dialog */}
      <ClientDetailsDialog 
        isOpen={isDetailsDialogOpen} 
        onOpenChange={setIsDetailsDialogOpen}
        client={selectedClient}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remover Cliente</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>Tem certeza que deseja remover este cliente? Esta ação não pode ser desfeita.</p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                Cancelar
              </Button>
              <Button variant="destructive" onClick={handleDeleteClient}>
                Remover
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Clients;
