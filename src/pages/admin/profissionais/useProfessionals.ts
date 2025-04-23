
import { useToast } from "@/hooks/use-toast";
import { Professional } from "@/lib/supabase";
import { validateProfessionalForm } from "./professionalUtils";
import { useProfessionalDialog } from "./hooks/useProfessionalDialog";
import { useProfessionalsCRUD } from "./hooks/useProfessionalsCRUD";

export const useProfessionals = () => {
  const { toast } = useToast();
  const dialog = useProfessionalDialog();

  const crud = useProfessionalsCRUD({
    setIsDialogOpen: dialog.setIsDialogOpen,
    setIsDeleteDialogOpen: dialog.setIsDeleteDialogOpen,
    resetForm: dialog.resetForm,
    setCurrentProfessional: dialog.setCurrentProfessional,
    toast,
  });

  // Form handlers
  const handleEdit = (professional: Professional) => {
    dialog.setCurrentProfessional(professional);
    dialog.setFormData({
      nome: professional.nome,
      dias_atendimento: professional.dias_atendimento || [],
      horario_inicio: professional.horario_inicio,
      horario_fim: professional.horario_fim,
    });
    dialog.setIsEditing(true);
    dialog.setIsDialogOpen(true);
  };

  const handleDelete = (professional: Professional) => {
    dialog.setCurrentProfessional(professional);
    dialog.setIsDeleteDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validateProfessionalForm(dialog.formData);
    dialog.setErrors(errors);
    if (Object.keys(errors).length > 0) return;

    const professionalData = {
      nome: dialog.formData.nome,
      dias_atendimento: dialog.formData.dias_atendimento,
      horario_inicio: dialog.formData.horario_inicio,
      horario_fim: dialog.formData.horario_fim,
    };

    if (dialog.isEditing && dialog.currentProfessional) {
      crud.updateProfessionalMutation.mutate({
        id: dialog.currentProfessional.id,
        professional: professionalData,
      });
    } else {
      crud.createProfessionalMutation.mutate(professionalData);
    }
  };

  return {
    professionals: crud.professionals,
    isLoading: crud.isLoading,
    isDialogOpen: dialog.isDialogOpen,
    setIsDialogOpen: dialog.setIsDialogOpen,
    isDeleteDialogOpen: dialog.isDeleteDialogOpen,
    setIsDeleteDialogOpen: dialog.setIsDeleteDialogOpen,
    isEditing: dialog.isEditing,
    setIsEditing: dialog.setIsEditing,
    currentProfessional: dialog.currentProfessional,
    setCurrentProfessional: dialog.setCurrentProfessional,
    formData: dialog.formData,
    setFormData: dialog.setFormData,
    errors: dialog.errors,
    setErrors: dialog.setErrors,
    handleSubmit,
    handleEdit,
    handleDelete,
    resetForm: dialog.resetForm,
    toggleDay: dialog.toggleDay,
    openNewProfessionalDialog: dialog.openNewProfessionalDialog,
    deleteProfessionalMutation: crud.deleteProfessionalMutation,
    createProfessionalMutation: crud.createProfessionalMutation,
    updateProfessionalMutation: crud.updateProfessionalMutation,
  };
};
