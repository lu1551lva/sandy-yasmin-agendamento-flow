
import { Professional } from "@/lib/supabase";

export interface ProfessionalFormData {
  nome: string;
  dias_atendimento: string[];
  horario_inicio: string;
  horario_fim: string;
}

export interface ProfessionalState {
  isDialogOpen: boolean;
  isDeleteDialogOpen: boolean;
  isEditing: boolean;
  currentProfessional: Professional | null;
  formData: ProfessionalFormData;
  errors: Record<string, string>;
}

export type ProfessionalFormField = keyof ProfessionalFormData;
