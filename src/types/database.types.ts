
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      agendamentos: {
        Row: {
          id: string
          cliente_id: string
          servico_id: string
          profissional_id: string
          data: string
          hora: string
          status: "agendado" | "concluido" | "cancelado" 
          ultima_mensagem_enviada_em: string | null
          created_at: string
        }
        Insert: {
          id?: string
          cliente_id: string
          servico_id: string
          profissional_id: string
          data: string
          hora: string
          status?: "agendado" | "concluido" | "cancelado"
          ultima_mensagem_enviada_em?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          cliente_id?: string
          servico_id?: string
          profissional_id?: string
          data?: string
          hora?: string
          status?: "agendado" | "concluido" | "cancelado"
          ultima_mensagem_enviada_em?: string | null
          created_at?: string
        }
      }
      clientes: {
        Row: {
          id: string
          nome: string
          telefone: string
          email: string
          created_at: string
        }
        Insert: {
          id?: string
          nome: string
          telefone: string
          email: string
          created_at?: string
        }
        Update: {
          id?: string
          nome?: string
          telefone?: string
          email?: string
          created_at?: string
        }
      }
      profissionais: {
        Row: {
          id: string
          nome: string
          dias_atendimento: string[] // ["segunda", "terca", "quarta", "quinta", "sexta", "sabado"]
          horario_inicio: string
          horario_fim: string
          created_at: string
        }
        Insert: {
          id?: string
          nome: string
          dias_atendimento: string[]
          horario_inicio: string
          horario_fim: string
          created_at?: string
        }
        Update: {
          id?: string
          nome?: string
          dias_atendimento?: string[]
          horario_inicio?: string
          horario_fim?: string
          created_at?: string
        }
      }
      servicos: {
        Row: {
          id: string
          nome: string
          valor: number
          duracao_em_minutos: number
          created_at: string
        }
        Insert: {
          id?: string
          nome: string
          valor: number
          duracao_em_minutos: number
          created_at?: string
        }
        Update: {
          id?: string
          nome?: string
          valor?: number
          duracao_em_minutos?: number
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
