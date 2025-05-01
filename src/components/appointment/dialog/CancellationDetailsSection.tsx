
import { AlertTriangle } from "lucide-react";

interface CancellationDetailsSectionProps {
  motivo: string;
}

export function CancellationDetailsSection({ motivo }: CancellationDetailsSectionProps) {
  return (
    <div className="space-y-2">
      <h3 className="text-lg font-medium">Motivo do Cancelamento</h3>
      <div className="flex items-start gap-2">
        <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5" />
        <p className="text-muted-foreground">{motivo}</p>
      </div>
    </div>
  );
}
