
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart2 } from "lucide-react";

const SuperAdminStatistics = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Estatísticas</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Estatísticas do Sistema</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-10">
          <BarChart2 className="h-16 w-16 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Estatísticas detalhadas em breve</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SuperAdminStatistics;
