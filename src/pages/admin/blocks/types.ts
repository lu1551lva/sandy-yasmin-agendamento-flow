
export interface Block {
  id: string;
  data_inicio: string;
  data_fim: string;
  hora_inicio?: string | null;
  hora_fim?: string | null;
  observacao?: string | null;
  created_at: string;
}

export interface BlockFormValues {
  data_inicio: Date;
  data_fim: Date;
  hora_inicio?: string;
  hora_fim?: string;
  observacao?: string;
}
