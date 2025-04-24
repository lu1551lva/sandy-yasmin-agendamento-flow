
import { Professional } from "@/lib/supabase";
import { ProfessionalFormData } from "../types/professional-state";

interface UseEditProfessionalProps {
  setCurrentProfessional: (p: Professional | null) => void;
  setFormData: (data: ProfessionalFormData) => void;
  setIsEditing: (editing: boolean) => void;
  setIsDialogOpen: (open: boolean) => void;
}

export function useEditProfessional({
  setCurrentProfessional,
  setFormData,
  setIsEditing,
  setIsDialogOpen,
}: UseEditProfessionalProps) {
  const handleEdit = (professional: Professional) => {
    console.log("Editando profissional:", professional);
    
    const diasAtendimento = Array.isArray(professional.dias_atendimento)
      ? professional.dias_atendimento
      : [];
    
    setCurrentProfessional(professional);
    setFormData({
      nome: professional.nome || "",
      dias_atendimento: diasAtendimento,
      horario_inicio: professional.horario_inicio || "08:00",
      horario_fim: professional.horario_fim || "18:00",
    });
    setIsEditing(true);
    setIsDialogOpen(true);
  };

  return { handleEdit };
}
