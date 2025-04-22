
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const WeeklySchedule = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold mb-2">Agenda Semanal</h1>
        <p className="text-muted-foreground">
          Visualize os agendamentos da semana
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Agenda Semanal</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              A visualização da agenda semanal será implementada em breve.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WeeklySchedule;
