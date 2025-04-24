
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { supabase, Professional } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

export function useProfessionals(selectedDate: Date | undefined) {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchProfessionals = async (date: Date) => {
      setIsLoading(true);
      setError(null);
      
      try {
        const dayName = format(date, "EEEE", { locale: ptBR });
        
        const dayMap: { [key: string]: string } = {
          'domingo': 'domingo',
          'segunda-feira': 'segunda', 
          'terça-feira': 'terca',
          'quarta-feira': 'quarta',
          'quinta-feira': 'quinta',
          'sexta-feira': 'sexta',
          'sábado': 'sabado'
        };
        
        const normalizedDay = dayMap[dayName];
        
        const { data, error } = await supabase
          .from("profissionais")
          .select("*");

        if (error) throw error;

        if (!data || data.length === 0) {
          setProfessionals([]);
          return;
        }

        const available = data.filter((professional) => {
          if (!Array.isArray(professional.dias_atendimento)) {
            console.warn(`Profissional ${professional.nome} com dias_atendimento inválidos:`, professional.dias_atendimento);
            return false;
          }
          return professional.dias_atendimento.includes(normalizedDay);
        });

        setProfessionals(available);
      } catch (err) {
        console.error("Erro ao buscar profissionais:", err);
        setError("Erro ao carregar os profissionais. Por favor, tente novamente.");
        toast({
          title: "Erro ao carregar profissionais",
          description: "Não foi possível carregar os dados dos profissionais",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (selectedDate) {
      fetchProfessionals(selectedDate);
    }
  }, [selectedDate, toast]);

  return { professionals, isLoading, error };
}
