
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
    
    // Garantir que dias_atendimento seja sempre um array de strings
    let diasAtendimento: string[] = [];
    
    if (p.dias_atendimento) {
      if (Array.isArray(p.dias_atendimento)) {
        diasAtendimento = p.dias_atendimento;
      } else {
        console.warn("dias_atendimento não é um array:", p.dias_atendimento);
        // Tentativa de converter outros formatos para array
        try {
          if (typeof p.dias_atendimento === 'object') {
            const diasObj = p.dias_atendimento as unknown as Record<string, boolean>;
            diasAtendimento = Object.entries(diasObj)
              .filter(([_, checked]) => checked)
              .map(([dia]) => dia);
          } else if (typeof p.dias_atendimento === 'string') {
            // Tenta converter string para array (caso seja JSON)
            try {
              const parsed = JSON.parse(p.dias_atendimento as unknown as string);
              if (Array.isArray(parsed)) {
                diasAtendimento = parsed;
              }
            } catch (e) {
              console.error("Erro ao fazer parse de dias_atendimento:", e);
            }
          }
        } catch (e) {
          console.error("Erro ao processar dias_atendimento:", e);
        }
      }
    }
    
    console.log("Dias de atendimento processados:", diasAtendimento);
      
    setForm({
      nome: p.nome || "",
      dias_atendimento: diasAtendimento,
      horario_inicio: p.horario_inicio || "08:00",
      horario_fim: p.horario_fim || "18:00",
    });
    setEditingId(p.id);
    setErrors({});
    setOpen(true);
  };

  const openForCreate = () => {
    console.log("Abrindo formulário para criar novo profissional");
    setForm(initialForm);
    setEditingId(null);
    setErrors({});
    setOpen(true);
  };

  const closeDialog = () => {
    console.log("Fechando diálogo de formulário");
    setOpen(false);
    setForm(initialForm);
    setEditingId(null);
    setErrors({});
    onCancel();
  };

  const handleChange = (field: keyof ProfessionalFormData, value: any) => {
    console.log(`Alterando campo ${field} para:`, value);
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Limpa o erro quando o campo é alterado
    if (errors[field]) {
      setErrors((e) => ({ ...e, [field]: undefined }));
    }
  };

  const toggleDay = (dia: string) => {
    console.log("Alternando dia:", dia);
    setForm((prev) => {
      // Garantir que dias_atendimento seja sempre um array
      const currentDias = Array.isArray(prev.dias_atendimento) ? [...prev.dias_atendimento] : [];
      
      const newDias = currentDias.includes(dia)
        ? currentDias.filter((d) => d !== dia)
        : [...currentDias, dia];
      
      console.log("Novos dias de atendimento:", newDias);
      return { ...prev, dias_atendimento: newDias };
    });
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    
    // Validação do nome
    if (!form.nome.trim()) {
      errs.nome = "O nome é obrigatório";
    }
    
    // Validação dos dias de atendimento
    if (!Array.isArray(form.dias_atendimento) || form.dias_atendimento.length === 0) {
      errs.dias_atendimento = "Selecione pelo menos um dia de atendimento";
    }
      
    // Validação dos horários
    if (!form.horario_inicio) {
      errs.horario_inicio = "Horário de início obrigatório";
    }
    
    if (!form.horario_fim) {
      errs.horario_fim = "Horário de término obrigatório";
    }

    // Verificar se o horário final é após o inicial
    if (form.horario_inicio && form.horario_fim) {
      const inicioHora = parseInt(form.horario_inicio.split(":")[0]);
      const fimHora = parseInt(form.horario_fim.split(":")[0]);
      
      if (fimHora <= inicioHora) {
        errs.horario_fim = "Horário final deve ser após o horário inicial";
      }
    }
    
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Enviando formulário com dados:", form);
    console.log("ID para edição:", editingId);
    
    if (!validate()) {
      console.log("Validação do formulário falhou. Erros:", errors);
      return;
    }
    
    // Garantir que dias_atendimento é um array antes do envio
    const diasAtendimento = Array.isArray(form.dias_atendimento) ? 
      form.dias_atendimento : 
      [];
    
    // Log dos dados sendo enviados
    const submissionData = {
      nome: form.nome,
      dias_atendimento: diasAtendimento,
      horario_inicio: form.horario_inicio,
      horario_fim: form.horario_fim,
    };
    
    console.log("Enviando dados validados:", submissionData);
    
    onSubmit(
      {
        ...form, 
        dias_atendimento: diasAtendimento
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
