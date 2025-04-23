
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import React from "react";
import { Professional } from "@/lib/supabase";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  professional: Professional | null;
  onDelete: () => void;
  onCancel: () => void;
}

const DeleteProfessionalDialog = ({
  open,
  onOpenChange,
  professional,
  onDelete,
  onCancel,
}: Props) => (
  <AlertDialog open={open} onOpenChange={onOpenChange}>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Excluir Profissional</AlertDialogTitle>
        <AlertDialogDescription>
          Tem certeza que deseja excluir a profissional{" "}
          <strong>{professional?.nome}</strong>? Esta ação não pode ser
          desfeita.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel onClick={onCancel}>
          Cancelar
        </AlertDialogCancel>
        <AlertDialogAction
          onClick={onDelete}
          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
        >
          Excluir
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
);

export default DeleteProfessionalDialog;
