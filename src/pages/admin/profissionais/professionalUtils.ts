
export function validateProfessionalForm(formData: {
  nome: string;
  dias_atendimento: string[];
  horario_inicio: string;
  horario_fim: string;
}) {
  const newErrors: Record<string, string> = {};
  if (!formData.nome.trim()) {
    newErrors.nome = "O nome da profissional é obrigatório";
  }
  if (formData.dias_atendimento.length === 0) {
    newErrors.dias_atendimento = "Selecione pelo menos um dia de atendimento";
  }
  if (!formData.horario_inicio) {
    newErrors.horario_inicio = "O horário de início é obrigatório";
  }
  if (!formData.horario_fim) {
    newErrors.horario_fim = "O horário de fim é obrigatório";
  }
  const startHour = parseInt(formData.horario_inicio.split(":")[0]);
  const endHour = parseInt(formData.horario_fim.split(":")[0]);
  if (endHour <= startHour) {
    newErrors.horario_fim = "O horário de fim deve ser maior que o horário de início";
  }
  return newErrors;
}
