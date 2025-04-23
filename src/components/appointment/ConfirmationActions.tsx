
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader } from "lucide-react";

interface ConfirmationActionsProps {
  isSubmitting: boolean;
  onConfirm: () => void;
  onBack?: () => void;  // Make this optional since it's not used in Confirmation.tsx
  className?: string;   // Add className prop
}

const ConfirmationActions = ({ isSubmitting, onConfirm, onBack, className }: ConfirmationActionsProps) => (
  <div className={className}>
    <Button onClick={onConfirm} disabled={isSubmitting} className="w-full">
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
