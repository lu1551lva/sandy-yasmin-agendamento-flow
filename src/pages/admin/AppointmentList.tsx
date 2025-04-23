
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase, AppointmentWithDetails } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { format, isToday, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  formatDate, 
  formatCurrency, 
  createWhatsAppLink, 
  formatWhatsAppTemplate,
  getWhatsAppTemplates
} from "@/lib/utils";
import { CalendarIcon, Check, Copy, Loader, MoreHorizontal, Send, X } from "lucide-react";
import { cn } from "@/lib/utils";

const AppointmentList = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [professionalFilter, setProfessionalFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [customMessage, setCustomMessage] = useState("");
  const [messageType, setMessageType] = useState("confirmation");
  const [isWhatsAppDialogOpen, setIsWhatsAppDialogOpen] = useState(false);
  const { toast } = useToast();

  // Get WhatsApp templates
  const whatsAppTemplates = getWhatsAppTemplates();

  // Fetch appointments
  const { data: appointments, isLoading, refetch } = useQuery({
    queryKey: ["appointments", selectedDate, statusFilter, professionalFilter, searchQuery],
    queryFn: async () => {
      let query = supabase
        .from("agendamentos")
        .select(`
          *,
          cliente:clientes(*),
          servico:servicos(*),
          profissional:profissionais(*)
        `);
      
      // Apply date filter
      if (selectedDate) {
        query = query.eq("data", format(selectedDate, "yyyy-MM-dd"));
      }
      
      // Apply status filter
      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }
      
      // Apply professional filter
      if (professionalFilter !== "all") {
        query = query.eq("profissional_id", professionalFilter);
      }
      
      // Execute query
      const { data, error } = await query.order("hora");
      
      if (error) throw error;
      
      // Apply search filter on client side
      if (searchQuery) {
        const lowerQuery = searchQuery.toLowerCase();
        return (data || []).filter((appt: any) => 
          appt.cliente.nome.toLowerCase().includes(lowerQuery) ||
          appt.cliente.telefone.includes(searchQuery) ||
          appt.cliente.email.toLowerCase().includes(lowerQuery) ||
          appt.servico.nome.toLowerCase().includes(lowerQuery)
        );
      }
      
      return data || [];
    },
  });

  // Fetch professionals for filter
  const { data: professionals } = useQuery({
    queryKey: ["professionals"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profissionais")
        .select("*")
        .order("nome");
      
      if (error) throw error;
      return data || [];
    },
  });

  // Update appointment status
  const updateAppointmentStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from("agendamentos")
        .update({ status })
        .eq("id", id);
      
      if (error) throw error;
      
      toast({
        title: "Status atualizado",
        description: `Agendamento marcado como ${status === "concluido" ? "concluído" : "cancelado"}.`,
      });
      
      refetch();
    } catch (error) {
      console.error("Error updating status:", error);
      toast({
        title: "Erro ao atualizar status",
        description: "Ocorreu um erro. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  // Format message with appointment data
  const formatMessage = (appointment: any, templateType: string) => {
    const template = whatsAppTemplates[templateType as keyof typeof whatsAppTemplates];
    
    return formatWhatsAppTemplate(template, {
      nome: appointment.cliente.nome.split(' ')[0],
      servico: appointment.servico.nome,
      data: formatDate(parseISO(appointment.data)),
      hora: appointment.hora,
      valor: formatCurrency(appointment.servico.valor),
    });
  };

  // Open WhatsApp dialog
  const openWhatsAppDialog = (appointment: any, type: string) => {
    setSelectedAppointment(appointment);
    setMessageType(type);
    setCustomMessage(formatMessage(appointment, type));
    setIsWhatsAppDialogOpen(true);
  };

  // Send WhatsApp message
  const sendWhatsAppMessage = async () => {
    if (!selectedAppointment) return;
    
    try {
      // Update last message timestamp
      await supabase
        .from("agendamentos")
        .update({ ultima_mensagem_enviada_em: new Date().toISOString() })
        .eq("id", selectedAppointment.id);
      
      // Open WhatsApp in new window
      window.open(
        createWhatsAppLink(selectedAppointment.cliente.telefone, customMessage),
        "_blank"
      );
      
      setIsWhatsAppDialogOpen(false);
      
      toast({
        title: "WhatsApp aberto",
        description: "A mensagem foi preparada para envio no WhatsApp.",
      });
    } catch (error) {
      console.error("Error updating message timestamp:", error);
      
      // Still open WhatsApp even if update fails
      window.open(
        createWhatsAppLink(selectedAppointment.cliente.telefone, customMessage),
        "_blank"
      );
      
      setIsWhatsAppDialogOpen(false);
    }
  };

  // Copy message to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Mensagem copiada",
      description: "A mensagem foi copiada para a área de transferência.",
    });
  };

  // Get status badge color
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "agendado":
        return "bg-blue-100 text-blue-800";
      case "concluido":
        return "bg-green-100 text-green-800";
      case "cancelado":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Get status text
  const getStatusText = (status: string) => {
    switch (status) {
      case "agendado":
        return "Agendado";
      case "concluido":
        return "Concluído";
      case "cancelado":
        return "Cancelado";
      default:
        return status;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold mb-2 font-playfair">Agendamentos</h1>
        <p className="text-muted-foreground">
          Gerencie todos os agendamentos do salão
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Date filter */}
            <div>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? (
                      format(selectedDate, "dd/MM/yyyy")
                    ) : (
                      <span>Escolha uma data</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 pointer-events-auto">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    initialFocus
                    locale={ptBR}
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Status filter */}
            <div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="agendado">Agendado</SelectItem>
                  <SelectItem value="concluido">Concluído</SelectItem>
                  <SelectItem value="cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Professional filter */}
            <div>
              <Select value={professionalFilter} onValueChange={setProfessionalFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Profissional" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os profissionais</SelectItem>
                  {professionals?.map((pro: any) => (
                    <SelectItem key={pro.id} value={pro.id}>
                      {pro.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Search */}
            <div>
              <Input
                placeholder="Buscar cliente ou serviço..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* WhatsApp Message Dialog */}
      <Dialog open={isWhatsAppDialogOpen} onOpenChange={setIsWhatsAppDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Enviar mensagem WhatsApp</DialogTitle>
            <DialogDescription>
              Personalize a mensagem antes de enviar via WhatsApp
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue={messageType} value={messageType} onValueChange={setMessageType}>
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="confirmation">Confirmação</TabsTrigger>
              <TabsTrigger value="reschedule">Reagendamento</TabsTrigger>
              <TabsTrigger value="cancellation">Cancelamento</TabsTrigger>
            </TabsList>
            
            <TabsContent value="confirmation" className="space-y-4">
              <Textarea 
                value={customMessage} 
                onChange={(e) => setCustomMessage(e.target.value)}
                className="min-h-[150px]"
              />
              <div className="flex justify-end">
                <Button variant="outline" size="sm" onClick={() => setCustomMessage(formatMessage(selectedAppointment, 'confirmation'))}>
                  Restaurar modelo
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="reschedule" className="space-y-4">
              <Textarea 
                value={customMessage} 
                onChange={(e) => setCustomMessage(e.target.value)}
                className="min-h-[150px]"
              />
              <div className="flex justify-end">
                <Button variant="outline" size="sm" onClick={() => setCustomMessage(formatMessage(selectedAppointment, 'reschedule'))}>
                  Restaurar modelo
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="cancellation" className="space-y-4">
              <Textarea 
                value={customMessage} 
                onChange={(e) => setCustomMessage(e.target.value)}
                className="min-h-[150px]"
              />
              <div className="flex justify-end">
                <Button variant="outline" size="sm" onClick={() => setCustomMessage(formatMessage(selectedAppointment, 'cancellation'))}>
                  Restaurar modelo
                </Button>
              </div>
            </TabsContent>
          </Tabs>
          
          <DialogFooter className="flex items-center justify-between">
            <Button variant="outline" onClick={() => copyToClipboard(customMessage)}>
              <Copy className="h-4 w-4 mr-2" /> Copiar
            </Button>
            <Button onClick={sendWhatsAppMessage}>
              <Send className="h-4 w-4 mr-2" /> Abrir WhatsApp
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Appointments list */}
      <Card>
        <CardHeader>
          <CardTitle>Resultados</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : appointments && appointments.length > 0 ? (
            <div className="space-y-4">
              {appointments.map((appointment: any) => (
                <div 
                  key={appointment.id} 
                  className={`p-4 border rounded-lg ${
                    appointment.status === "concluido" 
                      ? "bg-green-50 border-green-200" 
                      : appointment.status === "cancelado"
                      ? "bg-red-50 border-red-200"
                      : "bg-white"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">{appointment.cliente.nome}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadge(appointment.status)}`}>
                          {getStatusText(appointment.status)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{appointment.cliente.telefone}</p>
                      <p className="text-sm text-gray-600">{appointment.cliente.email}</p>
                      <div className="mt-2">
                        <p className="font-medium">{appointment.servico.nome}</p>
                        <p className="text-sm text-gray-600">
                          {formatCurrency(appointment.servico.valor)} • {appointment.servico.duracao_em_minutos} minutos
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-4 sm:mt-0 sm:text-right">
                      <p className="text-lg font-medium mb-1">
                        {isToday(parseISO(appointment.data)) ? "Hoje" : formatDate(parseISO(appointment.data))}
                      </p>
                      <p className="text-xl font-bold">{appointment.hora}</p>
                      <p className="text-sm text-gray-600">Com {appointment.profissional.nome}</p>
                      
                      <div className="mt-4 flex sm:justify-end gap-2">
                        {appointment.status === "agendado" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-green-600 border-green-600 hover:bg-green-50"
                            onClick={() => updateAppointmentStatus(appointment.id, "concluido")}
                          >
                            <Check className="h-4 w-4 mr-1" /> Concluído
                          </Button>
                        )}
                        
                        {appointment.status !== "cancelado" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 border-red-600 hover:bg-red-50"
                            onClick={() => updateAppointmentStatus(appointment.id, "cancelado")}
                          >
                            <X className="h-4 w-4 mr-1" /> Cancelar
                          </Button>
                        )}
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="sm" variant="ghost">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>WhatsApp</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            
                            <DropdownMenuItem onClick={() => openWhatsAppDialog(appointment, 'confirmation')}>
                              <Send className="h-4 w-4 mr-2" /> Enviar confirmação
                            </DropdownMenuItem>
                            
                            <DropdownMenuItem onClick={() => openWhatsAppDialog(appointment, 'reschedule')}>
                              <Send className="h-4 w-4 mr-2" /> Enviar reagendamento
                            </DropdownMenuItem>
                            
                            <DropdownMenuItem onClick={() => openWhatsAppDialog(appointment, 'cancellation')}>
                              <Send className="h-4 w-4 mr-2" /> Enviar cancelamento
                            </DropdownMenuItem>
                            
                            <DropdownMenuSeparator />
                            
                            <DropdownMenuItem onClick={() => copyToClipboard(formatMessage(appointment, 'confirmation'))}>
                              <Copy className="h-4 w-4 mr-2" /> Copiar mensagem
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              Nenhum agendamento encontrado para os filtros selecionados.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AppointmentList;
