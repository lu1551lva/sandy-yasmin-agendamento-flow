
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
    
    // Ensure dias_atendimento is always an array of strings
    let dias_atendimento: string[] = [];
    
    if (p.dias_atendimento) {
      if (Array.isArray(p.dias_atendimento)) {
        dias_atendimento = p.dias_atendimento;
      } else if (typeof p.dias_atendimento === 'object') {
        // Handle case where dias_atendimento is an object like {domingo: true}
        const diasObj = p.dias_atendimento as unknown as Record<string, boolean>;
        dias_atendimento = Object.entries(diasObj)
          .filter(([_, checked]) => checked)
          .map(([dia]) => dia);
      }
    }
    
    console.log("Processed dias_atendimento for form:", dias_atendimento);
      
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
    console.log("Opening form for creating new professional");
    setForm(initialForm);
    setEditingId(null);
    setErrors({});
    setOpen(true);
  };

  const closeDialog = () => {
    console.log("Closing professional form dialog");
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
      // Ensure dias_atendimento is always an array
      const currentDias = Array.isArray(prev.dias_atendimento) ? prev.dias_atendimento : [];
      
      const dias = currentDias.includes(dia)
        ? currentDias.filter((d) => d !== dia)
        : [...currentDias, dia];
      
      console.log("New dias_atendimento:", dias);
      return { ...prev, dias_atendimento: dias };
    });
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.nome.trim()) errs.nome = "O nome é obrigatório";
    
    // Ensure we're validating an array
    const dias = Array.isArray(form.dias_atendimento) ? form.dias_atendimento : [];
    if (dias.length < 1)
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
    
    // Ensure dias_atendimento is an array before submission
    const dias_atendimento = Array.isArray(form.dias_atendimento) ? form.dias_atendimento : [];
    
    // Log the data being submitted
    const submissionData = {
      nome: form.nome,
      dias_atendimento: dias_atendimento,
      horario_inicio: form.horario_inicio,
      horario_fim: form.horario_fim,
    };
    
    console.log("Submitting validated data:", submissionData);
    
    onSubmit(
      {
        ...form, 
        dias_atendimento: dias_atendimento
      }, 
      editingId || undefined
    );
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
