
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ServiceForm from "./ServiceForm";
import { Service } from "@/lib/supabase";

interface ServiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isEditing: boolean;
  currentService: Service | null;
  onSubmit: (data: any) => void;
  resetForm: () => void;
  categories: { id: string; nome: string }[];
}

const ServiceDialog = ({
  open,
  onOpenChange,
  isEditing,
  currentService,
  onSubmit,
  resetForm,
  categories,
}: ServiceDialogProps) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>
          {isEditing ? "Editar Serviço" : "Novo Serviço"}
        </DialogTitle>
      </DialogHeader>
      <ServiceForm
        isEditing={isEditing}
        currentService={currentService}
        onSubmit={onSubmit}
        resetForm={resetForm}
        categories={categories}
      />
    </DialogContent>
  </Dialog>
);

export default ServiceDialog;
