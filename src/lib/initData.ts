
import { supabase } from "@/lib/supabase";

const DEFAULT_SERVICES = [
  { nome: "Design de Sobrancelha", valor: 40.00, duracao_em_minutos: 30 },
  { nome: "Design com Henna", valor: 50.00, duracao_em_minutos: 45 },
  { nome: "Brow Lamination", valor: 120.00, duracao_em_minutos: 60 },
  { nome: "Micropigmentação sem retoque", valor: 350.00, duracao_em_minutos: 90 },
  { nome: "Micropigmentação com retoque", valor: 450.00, duracao_em_minutos: 120 },
  { nome: "Buço", valor: 12.00, duracao_em_minutos: 15 },
  { nome: "Extensões de Cílios – Clássico", valor: 140.00, duracao_em_minutos: 90 },
  { nome: "Extensões de Cílios – Volume Brasileiro", valor: 160.00, duracao_em_minutos: 120 },
  { nome: "Extensões de Cílios – Volume Russo", valor: 190.00, duracao_em_minutos: 150 },
  { nome: "Manutenção de Cílios", valor: 100.00, duracao_em_minutos: 60 },
  { nome: "Remoção de Cílios", valor: 30.00, duracao_em_minutos: 30 },
  { nome: "Spa Labial", valor: 25.00, duracao_em_minutos: 20 }
];

const DEFAULT_PROFESSIONALS = [
  { 
    nome: "Sandy Yasmin", 
    dias_atendimento: ["segunda", "terca", "quarta", "quinta", "sexta", "sabado"], 
    horario_inicio: "08:00", 
    horario_fim: "18:00" 
  }
];

const DEFAULT_ADMIN = {
  email: "admin@studio.com",
  senha: "admin123"
};

export const initializeDefaultData = async () => {
  try {
    // Check if there are any services
    const { data: existingServices, error: serviceError } = await supabase
      .from("servicos")
      .select("id")
      .limit(1);
    
    if (serviceError) throw serviceError;
    
    // If no services exist, add default services
    if (!existingServices || existingServices.length === 0) {
      console.log("Inserindo serviços padrão...");
      const { error: insertError } = await supabase
        .from("servicos")
        .insert(DEFAULT_SERVICES);
      
      if (insertError) throw insertError;
    }
    
    // Check if there are any professionals
    const { data: existingProfessionals, error: professionalError } = await supabase
      .from("profissionais")
      .select("id")
      .limit(1);
    
    if (professionalError) throw professionalError;
    
    // If no professionals exist, add default professional
    if (!existingProfessionals || existingProfessionals.length === 0) {
      console.log("Inserindo profissional padrão...");
      const { error: insertError } = await supabase
        .from("profissionais")
        .insert(DEFAULT_PROFESSIONALS);
      
      if (insertError) throw insertError;
    }
    
    // Check if there is an admin account
    const { data: existingAdmin, error: adminError } = await supabase
      .from("admins")
      .select("id")
      .limit(1);
    
    if (adminError) throw adminError;
    
    // If no admin exists, add default admin
    if (!existingAdmin || existingAdmin.length === 0) {
      console.log("Inserindo admin padrão...");
      const { error: insertError } = await supabase
        .from("admins")
        .insert(DEFAULT_ADMIN);
      
      if (insertError) throw insertError;
    }
    
    console.log("Inicialização concluída.");
    return { success: true };
  } catch (error) {
    console.error("Erro na inicialização dos dados:", error);
    return { success: false, error };
  }
};
