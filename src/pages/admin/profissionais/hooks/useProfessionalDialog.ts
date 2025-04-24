
import { useState } from "react";
import type { Professional } from "@/lib/supabase";

export function useProfessionalDialog() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentProfessional, setCurrentProfessional] = useState<Professional | null>(null);
  const [formData, setFormData] = useState({
    nome: "",
    dias_atendimento: [] as string[],
    horario_inicio: "08:00",
    horario_fim: "18:00",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const resetForm = () => {
    console.log("Resetando formulário");
    setFormData({
      nome: "",
      dias_atendimento: [],
      horario_inicio: "08:00",
      horario_fim: "18:00",
    });
    setErrors({});
    setIsEditing(false);
    setCurrentProfessional(null);
  };

  const toggleDay = (day: string) => {
    console.log("Alternando dia:", day);
    setFormData((prev) => {
      // Garantir que dias_atendimento seja sempre um array
      const days = Array.isArray(prev.dias_atendimento) ? [...prev.dias_atendimento] : [];
      
      const newDays = days.includes(day) 
        ? days.filter((d) => d !== day) 
        : [...days, day];
      
      console.log("Novos dias de atendimento:", newDays);
      return {
        ...prev,
        dias_atendimento: newDays,
      };
    });
    
    // Limpa o erro de dias_atendimento quando um dia é alterado
    if (errors.dias_atendimento) {
      setErrors((prev) => ({ ...prev, dias_atendimento: undefined }));
    }
  };

  const openNewProfessionalDialog = () => {
    console.log("Abrindo diálogo para novo profissional");
    resetForm();
    setIsDialogOpen(true);
  };

  return {
    isDialogOpen,
    setIsDialogOpen,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    isEditing,
    setIsEditing,
    currentProfessional,
    setCurrentProfessional,
    formData,
    setFormData,
    errors,
    setErrors,
    resetForm,
    toggleDay,
    openNewProfessionalDialog,
  };
}
