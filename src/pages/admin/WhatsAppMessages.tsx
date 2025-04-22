
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const WhatsAppMessages = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold mb-2">Mensagens WhatsApp</h1>
        <p className="text-muted-foreground">
          Gerencie modelos de mensagens para WhatsApp
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Modelos de Mensagens</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              O gerenciamento de modelos de mensagens será implementado em breve.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WhatsAppMessages;
