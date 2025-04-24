
import { useState } from "react";
import type { Professional } from "@/lib/supabase";

export interface ProfessionalFormData {
  nome: string;
  dias_atendimento: string[];
  horario_inicio: string;
  horario_fim: string;
}

const initialForm: ProfessionalFormData = {
  nome: "",
  dias_atendimento: [],
  horario_inicio: "08:00",
  horario_fim: "18:00",
};

export function useProfessionalForm(
  onSubmit: (data: ProfessionalFormData, idEdit?: string) => void,
  onCancel: () => void
) {
  const [form, setForm] = useState<ProfessionalFormData>(initialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const openForEdit = (p: Professional) => {
    console.log("Opening form for edit with data:", p);
    // Ensure dias_atendimento is an array
    const dias_atendimento = Array.isArray(p.dias_atendimento) 
      ? p.dias_atendimento 
      : [];
      
    setForm({
      nome: p.nome || "",
      dias_atendimento: dias_atendimento,
      horario_inicio: p.horario_inicio || "08:00",
      horario_fim: p.horario_fim || "18:00",
    });
    setEditingId(p.id);
    setErrors({});
    setOpen(true);
  };

  const openForCreate = () => {
    setForm(initialForm);
    setEditingId(null);
    setErrors({});
    setOpen(true);
  };

  const closeDialog = () => {
    setOpen(false);
    setForm(initialForm);
    setEditingId(null);
    setErrors({});
    onCancel();
  };

  const handleChange = (field: keyof ProfessionalFormData, value: any) => {
    console.log(`Changing field ${field} to:`, value);
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
    setErrors((e) => ({ ...e, [field]: undefined }));
  };

  const toggleDay = (dia: string) => {
    console.log("Toggling day:", dia);
    setForm((prev) => {
      const dias = prev.dias_atendimento.includes(dia)
        ? prev.dias_atendimento.filter((d) => d !== dia)
        : [...prev.dias_atendimento, dia];
      console.log("New dias_atendimento:", dias);
      return { ...prev, dias_atendimento: dias };
    });
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.nome.trim()) errs.nome = "O nome é obrigatório";
    if (form.dias_atendimento.length < 1)
      errs.dias_atendimento = "Escolha pelo menos um dia";
    if (!form.horario_inicio) errs.horario_inicio = "Horário obrigatório";
    if (!form.horario_fim) errs.horario_fim = "Horário obrigatório";

    const inicioHora = parseInt(form.horario_inicio.split(":")[0]);
    const fimHora = parseInt(form.horario_fim.split(":")[0]);
    
    if (fimHora <= inicioHora) {
      errs.horario_fim = "Horário final deve ser após o início";
    }
    
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Submitting form with data:", form);
    console.log("Editing ID:", editingId);
    
    if (!validate()) {
      console.log("Form validation failed. Errors:", errors);
      return;
    }
    
    // Log the data being submitted
    const submissionData = {
      nome: form.nome,
      dias_atendimento: form.dias_atendimento,
      horario_inicio: form.horario_inicio,
      horario_fim: form.horario_fim,
    };
    
    console.log("Submitting validated data:", submissionData);
    
    onSubmit(form, editingId || undefined);
    
    // Don't close dialog or reset form here - let the mutation success/error handlers do it
  };

  return {
    form,
    setForm,
    errors,
    setErrors,
    open,
    setOpen,
    openForEdit,
    openForCreate,
    closeDialog,
    editingId,
    handleChange,
    toggleDay,
    handleSubmit,
  };
}
