
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
    setFormData((prev) => {
      const days = [...prev.dias_atendimento];
      if (days.includes(day)) {
        return {
          ...prev,
          dias_atendimento: days.filter((d) => d !== day),
        };
      } else {
        return {
          ...prev,
          dias_atendimento: [...days, day],
        };
      }
    });
  };

  const openNewProfessionalDialog = () => {
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
