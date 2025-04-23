
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import SalonForm from "./SalonForm";
import { Plus } from "lucide-react";

interface CreateSalonDialogProps {
  onSuccess?: () => void;
}

export default function CreateSalonDialog({ onSuccess }: CreateSalonDialogProps) {
  const [open, setOpen] = useState(false);

  const handleSuccess = () => {
    setOpen(false);
    if (onSuccess) {
      onSuccess();
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Cadastrar Novo Salão
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Cadastrar Novo Salão</DialogTitle>
          <DialogDescription>
            Preencha os dados para criar um novo salão no sistema
          </DialogDescription>
        </DialogHeader>
        <SalonForm onSuccess={handleSuccess} onCancel={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
