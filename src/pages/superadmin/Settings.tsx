
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings } from "lucide-react";

const SuperAdminSettings = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Configurações</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Configurações do Sistema</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-10">
          <Settings className="h-16 w-16 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Configurações avançadas em breve</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SuperAdminSettings;
