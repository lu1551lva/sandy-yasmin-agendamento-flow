
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
    toast: { toast },
  });

  // Form handlers
  const handleEdit = (professional: Professional) => {
    console.log("Editing professional:", professional);
    
    // Ensure dias_atendimento is always an array of strings
    let diasAtendimento: string[] = [];
    
    if (professional.dias_atendimento) {
      if (Array.isArray(professional.dias_atendimento)) {
        diasAtendimento = professional.dias_atendimento;
      } else if (typeof professional.dias_atendimento === 'object') {
        // Handle case where dias_atendimento might be an object
        const diasObj = professional.dias_atendimento as unknown as Record<string, boolean>;
        diasAtendimento = Object.entries(diasObj)
          .filter(([_, checked]) => checked)
          .map(([dia]) => dia);
      }
    }
    
    console.log("Processed dias_atendimento:", diasAtendimento);
    
    dialog.setCurrentProfessional(professional);
    dialog.setFormData({
      nome: professional.nome,
      dias_atendimento: diasAtendimento,
      horario_inicio: professional.horario_inicio || "08:00",
      horario_fim: professional.horario_fim || "18:00",
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
    console.log("Submitting form with data:", dialog.formData);
    
    // Validate form data
    const errors = validateProfessionalForm(dialog.formData);
    dialog.setErrors(errors);
    
    if (Object.keys(errors).length > 0) {
      console.log("Form validation failed. Errors:", errors);
      return;
    }

    // Make sure dias_atendimento is always an array of strings
    const dias_atendimento = Array.isArray(dialog.formData.dias_atendimento) 
      ? dialog.formData.dias_atendimento 
      : [];
      
    // Validate that at least one day is selected
    if (dias_atendimento.length === 0) {
      dialog.setErrors({
        ...dialog.errors,
        dias_atendimento: "Selecione pelo menos um dia de atendimento"
      });
      return;
    }

    const professionalData = {
      nome: dialog.formData.nome,
      dias_atendimento: dias_atendimento,
      horario_inicio: dialog.formData.horario_inicio,
      horario_fim: dialog.formData.horario_fim,
    };
    
    console.log("Submitting professional data:", professionalData);
    console.log("Is editing:", dialog.isEditing);
    console.log("Current professional:", dialog.currentProfessional);

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
