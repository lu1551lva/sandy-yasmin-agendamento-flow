
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

// Convert form values to database format
export const blockFormToDbFormat = (values: BlockFormValues): Omit<Block, 'id' | 'created_at'> => {
  return {
    data_inicio: values.data_inicio.toISOString().split('T')[0],
    data_fim: values.data_fim.toISOString().split('T')[0],
    hora_inicio: values.hora_inicio || null,
    hora_fim: values.hora_fim || null,
    observacao: values.observacao || null,
  };
};

// Convert database values to form format
export const dbToBlockFormValues = (block: Block): BlockFormValues => {
  return {
    data_inicio: new Date(block.data_inicio),
    data_fim: new Date(block.data_fim),
    hora_inicio: block.hora_inicio || undefined,
    hora_fim: block.hora_fim || undefined,
    observacao: block.observacao || undefined,
  };
};
