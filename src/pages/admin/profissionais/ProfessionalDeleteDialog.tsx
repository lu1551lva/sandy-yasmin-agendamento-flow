
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogCancel,
  AlertDialogAction,
  AlertDialogDescription,
} from "@/components/ui/alert-dialog";
import { Professional } from "@/lib/supabase";

interface Props {
  open: boolean;
  professional: Professional | null;
  onCancel: () => void;
  onDelete: () => void;
}

const ProfessionalDeleteDialog = ({
  open,
  professional,
  onCancel,
  onDelete,
}: Props) => (
  <AlertDialog open={open}>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Excluir Profissional</AlertDialogTitle>
        <AlertDialogDescription>
          Tem certeza que deseja excluir <strong>{professional?.nome}</strong>?
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel onClick={onCancel}>Cancelar</AlertDialogCancel>
        <AlertDialogAction
          className="bg-destructive hover:bg-destructive/90"
          onClick={onDelete}
        >
          Excluir
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
);

export default ProfessionalDeleteDialog;
