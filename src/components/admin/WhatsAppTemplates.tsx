
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

interface WhatsAppTemplatesProps {
  clientName: string;
  clientPhone: string;
  serviceName: string;
  serviceDate: string;
  serviceTime: string;
  serviceDuration: number;
  servicePrice: number;
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
  onMessageSent
}: WhatsAppTemplatesProps) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("confirmar");
  const [customMessage, setCustomMessage] = useState("");

  // Template messages
  const templates = {
    confirmar: `Olá ${clientName}! 
    
Confirmamos seu agendamento no Studio Sandy Yasmin:

📅 Data: ${serviceDate}
⏰ Horário: ${serviceTime}
💇‍♀️ Serviço: ${serviceName}
⏱️ Duração: ${serviceDuration} minutos
💰 Valor: R$ ${servicePrice.toFixed(2)}

Para confirmar sua presença, por favor responda esta mensagem.
Em caso de cancelamento, pedimos que avise com pelo menos 24h de antecedência.

Obrigada pela preferência! 😊
Studio Sandy Yasmin`,

    reagendar: `Olá ${clientName}!
    
Infelizmente precisamos reagendar seu horário:

📅 Data: ${serviceDate}
⏰ Horário: ${serviceTime}
💇‍♀️ Serviço: ${serviceName}

Por favor, entre em contato conosco para escolher uma nova data e horário que seja conveniente para você.

Agradecemos pela compreensão!
Studio Sandy Yasmin`,

    cancelar: `Olá ${clientName}!
    
Infelizmente precisamos informar que seu agendamento precisou ser cancelado:

📅 Data: ${serviceDate}
⏰ Horário: ${serviceTime}
💇‍♀️ Serviço: ${serviceName}

Por favor, entre em contato conosco para remarcarmos em uma nova data.

Agradecemos pela compreensão!
Studio Sandy Yasmin`,

    personalizado: ""
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
    return templates[activeTab as keyof typeof templates];
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
              value={templates.confirmar} 
              readOnly 
            />
          </TabsContent>
          
          <TabsContent value="reagendar">
            <Textarea 
              className="min-h-[200px] font-mono text-sm" 
              value={templates.reagendar} 
              readOnly 
            />
          </TabsContent>
          
          <TabsContent value="cancelar">
            <Textarea 
              className="min-h-[200px] font-mono text-sm" 
              value={templates.cancelar} 
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
