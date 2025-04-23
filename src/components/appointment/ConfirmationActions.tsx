
import React from 'react';
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

export interface ConfirmationActionsProps {
  onConfirm: () => void;
  isSubmitting: boolean;
  className?: string; // Added className prop
}

const ConfirmationActions = ({ 
  onConfirm, 
  isSubmitting,
  className
}: ConfirmationActionsProps) => {
  return (
    <Button
      onClick={onConfirm}
      disabled={isSubmitting}
      className={className}
    >
      {isSubmitting ? (
        <span className="flex items-center gap-2">
          <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
          Confirmando...
        </span>
      ) : (
        <span className="flex items-center gap-2">
          <CheckCircle className="h-4 w-4" />
          Confirmar Agendamento
        </span>
      )}
    </Button>
  );
};

export default ConfirmationActions;
