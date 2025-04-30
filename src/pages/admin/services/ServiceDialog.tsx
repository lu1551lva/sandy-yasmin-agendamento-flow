
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ServiceForm from "./ServiceForm";
import { Service } from "@/lib/supabase";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useState } from "react";

interface ServiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isEditing: boolean;
  currentService: Service | null;
  onSubmit: (data: any) => void;
  resetForm: () => void;
  categories: { id: string; nome: string }[];
  isSubmitting?: boolean;
}

const ServiceDialog = ({
  open,
  onOpenChange,
  isEditing,
  currentService,
  onSubmit,
  resetForm,
  categories,
  isSubmitting = false,
}: ServiceDialogProps) => {
  const [error, setError] = useState<string | null>(null);

  // Wrapped onSubmit to handle errors
  const handleSubmit = (data: any) => {
    setError(null);
    try {
      onSubmit(data);
    } catch (err) {
      console.error("Error in service submission:", err);
      setError(typeof err === 'string' ? err : 'Erro ao processar o formulário. Tente novamente.');
    }
  };

  // Reset error when dialog closes
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setError(null);
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar Serviço" : "Novo Serviço"}
          </DialogTitle>
        </DialogHeader>
        
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <ServiceForm
          isEditing={isEditing}
          currentService={currentService}
          onSubmit={handleSubmit}
          resetForm={resetForm}
          categories={categories}
          isSubmitting={isSubmitting}
        />
      </DialogContent>
    </Dialog>
  );
};

export default ServiceDialog;
