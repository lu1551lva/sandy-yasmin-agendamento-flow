
export function validateProfessionalForm(formData: {
  nome: string;
  dias_atendimento: string[];
  horario_inicio: string;
  horario_fim: string;
}) {
  const newErrors: Record<string, string> = {};
  
  // Validação do nome
  if (!formData.nome || !formData.nome.trim()) {
    newErrors.nome = "O nome do profissional é obrigatório";
  }
  
  // Validação dos dias de atendimento
  if (!Array.isArray(formData.dias_atendimento) || formData.dias_atendimento.length === 0) {
    newErrors.dias_atendimento = "Selecione pelo menos um dia de atendimento";
  }
  
  // Validação dos horários
  if (!formData.horario_inicio) {
    newErrors.horario_inicio = "O horário de início é obrigatório";
  }
  
  if (!formData.horario_fim) {
    newErrors.horario_fim = "O horário de fim é obrigatório";
  }
  
  // Verificação se o horário final é posterior ao inicial
  if (formData.horario_inicio && formData.horario_fim) {
    const inicioHora = parseInt(formData.horario_inicio.split(":")[0]);
    const fimHora = parseInt(formData.horario_fim.split(":")[0]);
    
    if (fimHora <= inicioHora) {
      newErrors.horario_fim = "O horário de término deve ser após o horário de início";
    }
  }
  
  return newErrors;
}
