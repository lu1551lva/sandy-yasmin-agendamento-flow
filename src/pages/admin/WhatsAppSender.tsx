
import { useState } from "react";
import { format, addDays, isToday, isTomorrow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Send, 
  Calendar as CalendarIcon, 
  CheckCircle2, 
  Clock, 
  Loader2 
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { AppointmentWithDetails } from "@/types/appointment.types";
import { useWhatsAppMessages } from "@/hooks/useWhatsAppMessages";
import { useWhatsAppTemplates } from "@/hooks/useWhatsAppTemplates";
import { WhatsAppTemplatePreview } from "@/components/admin/WhatsAppTemplatePreview";

const WhatsAppSender = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTemplate, setSelectedTemplate] = useState<string>("confirmation");
  const [sending, setSending] = useState(false);
  const [selectedAppointments, setSelectedAppointments] = useState<string[]>([]);
  const [sentMessages, setSentMessages] = useState<string[]>([]);
  
  const { toast } = useToast();
  const { appointments, isLoading, filterByDate } = useWhatsAppMessages(selectedDate);
  const { templates, formatMessage } = useWhatsAppTemplates();
  
  // Filter appointments that haven't received messages yet
  const pendingAppointments = appointments.filter(
    app => !sentMessages.includes(app.id)
  );
  
  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      // Reset selections when date changes
      setSelectedAppointments([]);
      setSentMessages([]);
    }
  };
  
  const handleTemplateChange = (template: string) => {
    setSelectedTemplate(template);
  };
  
  const toggleAppointmentSelection = (appointmentId: string) => {
    setSelectedAppointments(prev => 
      prev.includes(appointmentId)
        ? prev.filter(id => id !== appointmentId)
        : [...prev, appointmentId]
    );
  };
  
  const selectAll = () => {
    setSelectedAppointments(pendingAppointments.map(app => app.id));
  };
  
  const clearSelection = () => {
    setSelectedAppointments([]);
  };
  
  // Get current appointment ready to send
  const getCurrentAppointment = () => {
    if (selectedAppointments.length === 0) return null;
    
    const appointmentId = selectedAppointments[0];
    return appointments.find(app => app.id === appointmentId) || null;
  };
  
  // Send a single message and prepare for the next one
  const sendNextMessage = async () => {
    const currentAppointment = getCurrentAppointment();
    
    if (!currentAppointment) {
      setSending(false);
      toast({
        title: "Envio concluído",
        description: "Todas as mensagens selecionadas foram enviadas.",
      });
      return;
    }
    
    try {
      // Format the message and open WhatsApp
      const message = formatMessage(selectedTemplate, {
        nome: currentAppointment.cliente.nome,
        servico: currentAppointment.servico.nome,
        data: format(new Date(currentAppointment.data), "dd/MM/yyyy"),
        hora: currentAppointment.hora,
        valor: `R$ ${currentAppointment.servico.valor.toFixed(2)}`,
        profissional: currentAppointment.profissional.nome
      });
      
      // Create and open the WhatsApp link
      const phoneNumber = currentAppointment.cliente.telefone;
      const whatsappUrl = createWhatsAppLink(phoneNumber, message);
      window.open(whatsappUrl, "_blank");
      
      // Mark as sent and remove from selection
      setSentMessages(prev => [...prev, currentAppointment.id]);
      setSelectedAppointments(prev => prev.filter(id => id !== currentAppointment.id));
      
      toast({
        title: "WhatsApp aberto",
        description: `Mensagem preparada para ${currentAppointment.cliente.nome}`,
      });
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
      toast({
        title: "Erro ao enviar mensagem",
        description: "Não foi possível abrir o WhatsApp.",
        variant: "destructive",
      });
    }
  };
  
  // Start the sending process
  const startSending = () => {
    if (selectedAppointments.length === 0) {
      toast({
        title: "Nenhum agendamento selecionado",
        description: "Por favor, selecione pelo menos um agendamento para enviar mensagem.",
        variant: "destructive",
      });
      return;
    }
    
    setSending(true);
    sendNextMessage();
  };
  
  // Helper to determine day label
  const getDayLabel = () => {
    if (isToday(selectedDate)) return "hoje";
    if (isTomorrow(selectedDate)) return "amanhã";
    return format(selectedDate, "dd 'de' MMMM", { locale: ptBR });
  };
  
  const getTabs = () => {
    // Create tab content for different time frames
    const today = new Date();
    const tomorrow = addDays(today, 1);
    
    return (
      <Tabs defaultValue="today" className="w-full">
        <TabsList>
          <TabsTrigger value="today">Hoje</TabsTrigger>
          <TabsTrigger value="tomorrow">Amanhã</TabsTrigger>
          <TabsTrigger value="custom">Data personalizada</TabsTrigger>
        </TabsList>
        
        <TabsContent value="today" className="space-y-4">
          {/* Fix: Use effect instead of expression and wrap in a fragment */}
          <div className="hidden">
            {/* This is now a self-executing function that returns null */}
            {(() => {
              handleDateChange(today);
              return null;
            })()}
          </div>
          {renderAppointmentList()}
        </TabsContent>
        
        <TabsContent value="tomorrow" className="space-y-4">
          {/* Fix: Similar fix here */}
          <div className="hidden">
            {(() => {
              handleDateChange(tomorrow);
              return null;
            })()}
          </div>
          {renderAppointmentList()}
        </TabsContent>
        
        <TabsContent value="custom" className="space-y-4">
          <div className="flex flex-col space-y-4">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateChange}
              className="rounded-md border mx-auto"
            />
            {renderAppointmentList()}
          </div>
        </TabsContent>
      </Tabs>
    );
  };
  
  const renderAppointmentList = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      );
    }
    
    if (appointments.length === 0) {
      return (
        <Card>
          <CardContent className="pt-6 text-center text-muted-foreground">
            Nenhum agendamento encontrado para {getDayLabel()}.
          </CardContent>
        </Card>
      );
    }
    
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-medium">
            {appointments.length} agendamentos para {getDayLabel()}
          </h3>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={selectAll}>
              Selecionar todos
            </Button>
            <Button variant="outline" size="sm" onClick={clearSelection}>
              Limpar seleção
            </Button>
          </div>
        </div>
        
        <Card>
          <CardContent className="p-0">
            <div className="divide-y">
              {pendingAppointments.length === 0 && sentMessages.length > 0 ? (
                <div className="p-4 text-center text-green-600">
                  <CheckCircle2 className="mx-auto h-6 w-6 mb-2" />
                  <p>Todas as mensagens foram enviadas!</p>
                </div>
              ) : (
                pendingAppointments.map(appointment => (
                  <div
                    key={appointment.id}
                    className={`p-4 flex items-center justify-between hover:bg-muted/50 cursor-pointer ${
                      selectedAppointments.includes(appointment.id) ? "bg-muted" : ""
                    }`}
                    onClick={() => toggleAppointmentSelection(appointment.id)}
                  >
                    <div className="flex items-center gap-4">
                      <input
                        type="checkbox"
                        checked={selectedAppointments.includes(appointment.id)}
                        onChange={(e) => {
                          e.stopPropagation();
                          toggleAppointmentSelection(appointment.id);
                        }}
                        className="h-4 w-4"
                      />
                      <div>
                        <div className="font-medium">{appointment.cliente.nome}</div>
                        <div className="text-sm text-muted-foreground">{appointment.servico.nome}</div>
                      </div>
                    </div>
                    <div className="flex items-center text-sm">
                      <Clock className="h-4 w-4 mr-1" />
                      {appointment.hora}
                    </div>
                  </div>
                ))
              )}
              
              {sentMessages.length > 0 && (
                <div className="p-2 bg-muted/30">
                  <div className="text-sm font-medium text-muted-foreground px-2 py-1">
                    Mensagens enviadas ({sentMessages.length})
                  </div>
                  <div className="divide-y divide-muted/20">
                    {appointments
                      .filter(app => sentMessages.includes(app.id))
                      .map(appointment => (
                        <div
                          key={appointment.id}
                          className="p-2 px-4 flex items-center justify-between text-muted-foreground"
                        >
                          <div className="flex items-center gap-4">
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                            <div>
                              <div className="font-medium">{appointment.cliente.nome}</div>
                              <div className="text-xs">{appointment.hora} - {appointment.servico.nome}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };
  
  // Function to create WhatsApp link from the util function
  const createWhatsAppLink = (phoneNumber: string, message: string) => {
    // Import from lib/whatsappUtils wasn't working inside component, so implementing inline
    const formattedPhone = phoneNumber.replace(/\D/g, '');
    const whatsAppPhone = formattedPhone.startsWith('55') ? formattedPhone : `55${formattedPhone}`;
    return `https://wa.me/${whatsAppPhone}?text=${encodeURIComponent(message)}`;
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Envio de mensagens WhatsApp</h1>
        <p className="text-muted-foreground mt-1">
          Selecione agendamentos e envie mensagens por WhatsApp para vários clientes
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          {getTabs()}
        </div>
        
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Modelo da Mensagem</CardTitle>
              <CardDescription>
                Selecione o tipo de mensagem que será enviada
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Select value={selectedTemplate} onValueChange={handleTemplateChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um modelo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="confirmation">Confirmação</SelectItem>
                  <SelectItem value="reminder">Lembrete</SelectItem>
                  <SelectItem value="reschedule">Reagendamento</SelectItem>
                  <SelectItem value="cancellation">Cancelamento</SelectItem>
                  <SelectItem value="followup">Pós-atendimento</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full" 
                onClick={startSending} 
                disabled={selectedAppointments.length === 0}
              >
                <Send className="mr-2 h-4 w-4" />
                {sending ? 'Continuar enviando' : 'Iniciar envio sequencial'}
              </Button>
            </CardFooter>
          </Card>
          
          <WhatsAppTemplatePreview 
            templateKey={selectedTemplate}
            appointment={getCurrentAppointment()}
          />
          
          <Card>
            <CardContent className="pt-6">
              <div className="text-sm text-muted-foreground space-y-2">
                <p><strong>Como funciona:</strong></p>
                <p>1. Selecione os agendamentos que deseja contactar</p>
                <p>2. Escolha o modelo de mensagem</p>
                <p>3. Clique em "Iniciar envio sequencial"</p>
                <p>4. Um WhatsApp será aberto para cada cliente</p>
                <p>5. Confirme o envio de cada mensagem no WhatsApp</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default WhatsAppSender;
