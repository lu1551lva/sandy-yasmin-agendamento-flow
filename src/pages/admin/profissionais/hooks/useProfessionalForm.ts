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
    setForm({
      nome: p.nome,
      dias_atendimento: p.dias_atendimento,
      horario_inicio: p.horario_inicio,
      horario_fim: p.horario_fim,
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
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
    setErrors((e) => ({ ...e, [field]: undefined }));
  };

  const toggleDay = (dia: string) => {
    setForm((prev) => {
      const dias = prev.dias_atendimento.includes(dia)
        ? prev.dias_atendimento.filter((d) => d !== dia)
        : [...prev.dias_atendimento, dia];
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
    if (
      parseInt(form.horario_fim.split(":")[0]) <=
      parseInt(form.horario_inicio.split(":")[0])
    )
      errs.horario_fim = "Horário final após início";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit(form, editingId || undefined);
    setOpen(false);
    setForm(initialForm);
    setEditingId(null);
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
