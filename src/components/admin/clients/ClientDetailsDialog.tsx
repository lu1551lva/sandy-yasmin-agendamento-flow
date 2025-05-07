
import { useEffect, useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { formatDate } from "@/lib/dateUtils";
import { Badge } from "@/components/ui/badge";
import { AppointmentWithDetails } from "@/types/appointment.types";

interface Cliente {
  id: string;
  nome: string;
  telefone: string;
  email: string;
  created_at: string;
}

interface ClientDetailsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  client: Cliente | null;
}

export function ClientDetailsDialog({ isOpen, onOpenChange, client }: ClientDetailsDialogProps) {
  const [appointments, setAppointments] = useState<AppointmentWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    if (isOpen && client) {
      fetchAppointments();
    }
  }, [isOpen, client]);
  
  const fetchAppointments = async () => {
    if (!client) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('agendamentos')
        .select(`
          *,
          cliente:cliente_id(*),
          servico:servico_id(*),
          profissional:profissional_id(*)
        `)
        .eq('cliente_id', client.id)
        .order('data', { ascending: false });
        
      if (error) throw error;
      
      setAppointments(data || []);
    } catch (error) {
      console.error('Error fetching client appointments:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Helper function to get status badge color
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "agendado":
        return <Badge className="bg-blue-500">Agendado</Badge>;
      case "concluido":
        return <Badge className="bg-green-500">Concluído</Badge>;
      case "cancelado":
        return <Badge className="bg-red-500">Cancelado</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };
  
  if (!client) return null;
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Detalhes do Cliente</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Client Details */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-medium mb-3">Informações do Cliente</h3>
              <div className="grid grid-cols-1 gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Nome:</span>
                  <span className="font-medium">{client.nome}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Telefone:</span>
                  <span className="font-medium">{client.telefone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Email:</span>
                  <span className="font-medium">{client.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Data de cadastro:</span>
                  <span className="font-medium">
                    {formatDate(new Date(client.created_at))}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Appointment History */}
          <div>
            <h3 className="font-medium mb-3">Histórico de Agendamentos</h3>
            {isLoading ? (
              <p className="text-center py-4 text-sm text-muted-foreground">Carregando agendamentos...</p>
            ) : appointments.length === 0 ? (
              <p className="text-center py-4 text-sm text-muted-foreground">Este cliente não possui agendamentos.</p>
            ) : (
              <div className="space-y-3">
                {appointments.map((appointment) => (
                  <Card key={appointment.id}>
                    <CardContent className="pt-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">{appointment.servico.nome}</span>
                        {getStatusBadge(appointment.status)}
                      </div>
                      <div className="text-sm space-y-1">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Profissional:</span>
                          <span>{appointment.profissional.nome}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Data/Hora:</span>
                          <span>{formatDate(new Date(appointment.data))} às {appointment.hora}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
