
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Send } from "lucide-react";
import { createWhatsAppLink } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { getWhatsAppTemplates, formatWhatsAppTemplate } from "@/lib/whatsappUtils";

interface WhatsAppTemplatesProps {
  clientName: string;
  clientPhone: string;
  serviceName: string;
  serviceDate: string;
  serviceTime: string;
  serviceDuration: number;
  servicePrice: number;
  professionalName: string;
  onMessageSent: () => void;
}

const WhatsAppTemplates = ({
  clientName,
  clientPhone,
  serviceName,
  serviceDate,
  serviceTime,
  serviceDuration,
  servicePrice,
  professionalName,
  onMessageSent
}: WhatsAppTemplatesProps) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("confirmar");
  const [customMessage, setCustomMessage] = useState("");

  // Get templates from helper function
  const templates = getWhatsAppTemplates();

  // Template variables
  const templateVars = {
    nome: clientName,
    servico: serviceName,
    profissional: professionalName,
    data: serviceDate,
    hora: serviceTime,
    duracao: `${serviceDuration} minutos`,
    valor: `R$ ${servicePrice.toFixed(2)}`,
  };

  // Initialize custom message when tab changes
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    if (value === "personalizado" && customMessage === "") {
      setCustomMessage(`Olá ${clientName}!\n\n`);
    }
  };

  // Get current message based on active tab
  const getCurrentMessage = () => {
    if (activeTab === "personalizado") {
      return customMessage;
    }
    
    const template = templates[activeTab as keyof typeof templates] || "";
    return formatWhatsAppTemplate(template, templateVars);
  };

  // Send WhatsApp message
  const handleSendMessage = () => {
    const message = getCurrentMessage();
    if (!message.trim()) {
      toast({
        title: "Mensagem vazia",
        description: "Por favor, adicione uma mensagem para enviar.",
        variant: "destructive"
      });
      return;
    }

    if (!clientPhone) {
      toast({
        title: "Telefone inválido",
        description: "O cliente não possui um número de telefone válido.",
        variant: "destructive"
      });
      return;
    }

    // Open WhatsApp with message
    window.open(createWhatsAppLink(clientPhone, message), "_blank");
    
    // Call callback function
    onMessageSent();
    
    toast({
      title: "WhatsApp aberto",
      description: "A mensagem foi preparada para envio via WhatsApp.",
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Enviar Mensagem por WhatsApp</CardTitle>
        <CardDescription>
          Selecione um modelo ou personalize sua mensagem
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="confirmar" value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="confirmar">Confirmar</TabsTrigger>
            <TabsTrigger value="reagendar">Reagendar</TabsTrigger>
            <TabsTrigger value="cancelar">Cancelar</TabsTrigger>
            <TabsTrigger value="personalizado">Personalizar</TabsTrigger>
          </TabsList>
          
          <TabsContent value="confirmar">
            <Textarea 
              className="min-h-[200px] font-mono text-sm" 
              value={formatWhatsAppTemplate(templates.confirmation, templateVars)} 
              readOnly 
            />
          </TabsContent>
          
          <TabsContent value="reagendar">
            <Textarea 
              className="min-h-[200px] font-mono text-sm" 
              value={formatWhatsAppTemplate(templates.reschedule, templateVars)} 
              readOnly 
            />
          </TabsContent>
          
          <TabsContent value="cancelar">
            <Textarea 
              className="min-h-[200px] font-mono text-sm" 
              value={formatWhatsAppTemplate(templates.cancellation, templateVars)} 
              readOnly 
            />
          </TabsContent>
          
          <TabsContent value="personalizado">
            <div className="space-y-2">
              <Label htmlFor="custom-message">Mensagem personalizada</Label>
              <Textarea 
                id="custom-message"
                className="min-h-[200px] font-mono text-sm" 
                value={customMessage} 
                onChange={(e) => setCustomMessage(e.target.value)}
                placeholder="Digite sua mensagem personalizada..."
              />
              <p className="text-xs text-muted-foreground">
                Use variáveis como: nome do cliente, serviço, data, etc.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button onClick={handleSendMessage} className="flex items-center gap-2">
          <Send className="h-4 w-4" /> Enviar via WhatsApp
        </Button>
      </CardFooter>
    </Card>
  );
};

export default WhatsAppTemplates;
