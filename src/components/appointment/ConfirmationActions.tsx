
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader } from "lucide-react";

interface ConfirmationActionsProps {
  isSubmitting: boolean;
  onConfirm: () => void;
  onBack: () => void;
}

const ConfirmationActions = ({ isSubmitting, onConfirm, onBack }: ConfirmationActionsProps) => (
  <div className="flex justify-between">
    <Button variant="outline" onClick={onBack} disabled={isSubmitting}>
      <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
    </Button>
    <Button onClick={onConfirm} disabled={isSubmitting}>
      {isSubmitting ? (
        <>
          <Loader className="mr-2 h-4 w-4 animate-spin" /> Processando...
        </>
      ) : (
        "Confirmar agendamento"
      )}
    </Button>
  </div>
);

export default ConfirmationActions;
