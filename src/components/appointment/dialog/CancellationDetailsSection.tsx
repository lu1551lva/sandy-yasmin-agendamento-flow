
import { AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface CancellationDetailsSectionProps {
  motivo: string;
}

export function CancellationDetailsSection({ motivo }: CancellationDetailsSectionProps) {
  return (
    <div className="space-y-2 p-3 bg-red-50 rounded-lg border border-red-100">
      <h3 className="text-lg font-medium flex items-center gap-2 text-red-700">
        <AlertTriangle className="h-5 w-5" />
        Motivo do Cancelamento
      </h3>
      <Alert variant="destructive" className="bg-red-50 text-red-800 border-red-200">
        <AlertDescription className="text-muted-foreground">
          {motivo}
        </AlertDescription>
      </Alert>
    </div>
  );
}
