
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Services = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold mb-2">Serviços</h1>
        <p className="text-muted-foreground">
          Gerencie os serviços oferecidos pelo salão
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Gerenciamento de Serviços</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              O gerenciamento de serviços será implementado em breve.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Services;
