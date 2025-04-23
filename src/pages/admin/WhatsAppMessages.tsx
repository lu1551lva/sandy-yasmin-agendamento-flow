
import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Copy } from "lucide-react";

const defaultTemplates = {
  confirmation: `Olá {nome}! Confirmamos seu agendamento no Studio Sandy Yasmin para {servico} no dia {data} às {hora}. Valor: {valor}. Aguardamos sua presença!`,
  
  reminder: `Olá {nome}! Passando para lembrar do seu agendamento amanhã às {hora} para {servico}. Caso precise remarcar, entre em contato conosco. Obrigado!`,
  
  reschedule: `Olá {nome}! Precisamos remarcar seu agendamento para {servico} que está marcado para {data} às {hora}. Por favor, entre em contato conosco para agendar uma nova data e horário. Agradecemos a compreensão!`,
  
  cancellation: `Olá {nome}! Lamentamos informar que precisamos cancelar seu agendamento para {servico} no dia {data} às {hora}. Por favor, entre em contato conosco para mais informações. Pedimos desculpas pelo inconveniente.`,
  
  followup: `Olá {nome}! Como foi sua experiência com o serviço {servico} no Studio Sandy Yasmin? Ficaríamos felizes em receber seu feedback. Obrigado pela preferência!`
};

const WhatsAppMessages = () => {
  const [templates, setTemplates] = useState(() => {
    const savedTemplates = localStorage.getItem('whatsappTemplates');
    return savedTemplates ? JSON.parse(savedTemplates) : defaultTemplates;
  });
  
  const [activeTab, setActiveTab] = useState("confirmation");
  const { toast } = useToast();

  const handleTemplateChange = (value: string) => {
    const newTemplates = { ...templates, [activeTab]: value };
    setTemplates(newTemplates);
    localStorage.setItem('whatsappTemplates', JSON.stringify(newTemplates));
  };

  const resetToDefault = () => {
    const newTemplates = { ...templates, [activeTab]: defaultTemplates[activeTab as keyof typeof defaultTemplates] };
    setTemplates(newTemplates);
    localStorage.setItem('whatsappTemplates', JSON.stringify(newTemplates));
    toast({
      title: "Modelo restaurado",
      description: "O modelo foi restaurado para o padrão",
    });
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(templates[activeTab as keyof typeof templates]);
    toast({
      title: "Copiado!",
      description: "Modelo copiado para a área de transferência",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold mb-2 font-playfair">Mensagens WhatsApp</h1>
        <p className="text-muted-foreground">
          Gerencie seus modelos de mensagens para envio pelo WhatsApp
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Modelos de Mensagens</CardTitle>
          <CardDescription>
            Você pode personalizar estes modelos que serão usados para enviar mensagens via WhatsApp.
            Utilize as variáveis {"{nome}"}, {"{servico}"}, {"{data}"}, {"{hora}"} e {"{valor}"} que serão substituídas
            automaticamente pelos dados do agendamento.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs 
            defaultValue="confirmation" 
            value={activeTab} 
            onValueChange={setActiveTab}
            className="mt-2"
          >
            <TabsList className="w-full mb-4">
              <TabsTrigger value="confirmation">Confirmação</TabsTrigger>
              <TabsTrigger value="reminder">Lembrete</TabsTrigger>
              <TabsTrigger value="reschedule">Reagendamento</TabsTrigger>
              <TabsTrigger value="cancellation">Cancelamento</TabsTrigger>
              <TabsTrigger value="followup">Pós-atendimento</TabsTrigger>
            </TabsList>
            
            <TabsContent value="confirmation">
              <Textarea 
                value={templates.confirmation} 
                onChange={(e) => handleTemplateChange(e.target.value)}
                className="min-h-[150px]"
                placeholder="Digite o modelo de mensagem para confirmação..."
              />
            </TabsContent>
            
            <TabsContent value="reminder">
              <Textarea 
                value={templates.reminder} 
                onChange={(e) => handleTemplateChange(e.target.value)}
                className="min-h-[150px]"
                placeholder="Digite o modelo de mensagem para lembrete..."
              />
            </TabsContent>
            
            <TabsContent value="reschedule">
              <Textarea 
                value={templates.reschedule} 
                onChange={(e) => handleTemplateChange(e.target.value)}
                className="min-h-[150px]"
                placeholder="Digite o modelo de mensagem para reagendamento..."
              />
            </TabsContent>
            
            <TabsContent value="cancellation">
              <Textarea 
                value={templates.cancellation} 
                onChange={(e) => handleTemplateChange(e.target.value)}
                className="min-h-[150px]"
                placeholder="Digite o modelo de mensagem para cancelamento..."
              />
            </TabsContent>
            
            <TabsContent value="followup">
              <Textarea 
                value={templates.followup} 
                onChange={(e) => handleTemplateChange(e.target.value)}
                className="min-h-[150px]"
                placeholder="Digite o modelo de mensagem para pós-atendimento..."
              />
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={resetToDefault}>
            Restaurar padrão
          </Button>
          <Button onClick={copyToClipboard}>
            <Copy className="h-4 w-4 mr-2" /> Copiar modelo
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Como usar</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">Variáveis disponíveis:</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li><code className="bg-gray-100 px-1 rounded">{"{nome}"}</code> - Nome do cliente</li>
                <li><code className="bg-gray-100 px-1 rounded">{"{servico}"}</code> - Nome do serviço agendado</li>
                <li><code className="bg-gray-100 px-1 rounded">{"{data}"}</code> - Data do agendamento</li>
                <li><code className="bg-gray-100 px-1 rounded">{"{hora}"}</code> - Horário do agendamento</li>
                <li><code className="bg-gray-100 px-1 rounded">{"{valor}"}</code> - Valor do serviço</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">Como enviar mensagens:</h3>
              <p>
                1. Selecione um cliente na listagem de agendamentos<br />
                2. Clique no botão de WhatsApp<br />
                3. Escolha o modelo de mensagem adequado<br />
                4. O sistema abrirá o WhatsApp com a mensagem preenchida<br />
                5. Revise e envie a mensagem
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WhatsAppMessages;
