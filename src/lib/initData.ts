
import { supabase } from "@/lib/supabase";

// Initialize default data for the salon if it doesn't exist
export const initializeDefaultData = async () => {
  try {
    // Check if services exist
    const { data: services, error: servicesError } = await supabase
      .from("servicos")
      .select("*")
      .limit(1);

    if (servicesError) throw servicesError;

    // If no services, insert default ones
    if (services.length === 0) {
      await supabase.from("servicos").insert([
        {
          nome: "Corte de Cabelo",
          valor: 80,
          duracao_em_minutos: 60,
          ativo: true,
        },
        {
          nome: "Hidratação",
          valor: 120,
          duracao_em_minutos: 90,
          ativo: true,
        },
        {
          nome: "Coloração",
          valor: 150,
          duracao_em_minutos: 120,
          ativo: true,
        },
        {
          nome: "Escova",
          valor: 60,
          duracao_em_minutos: 45,
          ativo: true,
        },
      ]);
    }

    // Check if professionals exist
    const { data: professionals, error: professionalsError } = await supabase
      .from("profissionais")
      .select("*")
      .limit(1);

    if (professionalsError) throw professionalsError;

    // If no professionals, insert default ones
    if (professionals.length === 0) {
      await supabase.from("profissionais").insert([
        {
          nome: "Sandy Yasmin",
          dias_atendimento: ["segunda", "terca", "quarta", "quinta", "sexta"],
          horario_inicio: "09:00",
          horario_fim: "18:00",
        },
        {
          nome: "Maria Silva",
          dias_atendimento: ["segunda", "quarta", "sexta"],
          horario_inicio: "09:00",
          horario_fim: "18:00",
        },
      ]);
    }

    console.log("Default data initialized successfully");
  } catch (error) {
    console.error("Error initializing default data:", error);
  }
};
