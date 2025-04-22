
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Professionals = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold mb-2">Profissionais</h1>
        <p className="text-muted-foreground">
          Gerencie os profissionais do salão
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Gerenciamento de Profissionais</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              O gerenciamento de profissionais será implementado em breve.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Professionals;
