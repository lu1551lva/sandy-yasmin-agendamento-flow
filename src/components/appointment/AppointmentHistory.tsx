
import { useQuery } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { supabase } from "@/lib/supabase";
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  Calendar, 
  CalendarClock
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

interface AppointmentHistoryProps {
  appointmentId: string;
}

export function AppointmentHistory({ appointmentId }: AppointmentHistoryProps) {
  const { data, isLoading } = useQuery({
    queryKey: ["appointment-history", appointmentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("agendamento_historico")
        .select("*")
        .eq("agendamento_id", appointmentId)
        .order("criado_em", { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array(3).fill(0).map((_, i) => (
          <div key={i} className="flex items-start gap-4">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-3 w-4/5" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground">
        Nenhum registro encontrado para este agendamento.
      </div>
    );
  }

  const getActionIcon = (tipo: string) => {
    switch (tipo) {
      case "criado":
        return <Calendar className="h-5 w-5 text-blue-500" />;
      case "status_alterado":
        return <Clock className="h-5 w-5 text-amber-500" />;
      case "reagendado":
        return <CalendarClock className="h-5 w-5 text-purple-500" />;
      case "concluido":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "cancelado":
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getActionText = (entry: any) => {
    switch (entry.tipo) {
      case "criado":
        return "Agendamento criado";
      case "status_alterado":
        return `Status alterado para: ${entry.novo_valor}`;
      case "reagendado":
        return `Reagendado de ${entry.valor_anterior} para ${entry.novo_valor}`;
      case "concluido":
        return "Agendamento concluído";
      case "cancelado":
        return "Agendamento cancelado";
      default:
        return entry.descricao || "Ação não especificada";
    }
  };

  return (
    <div className="space-y-4">
      {data.map((entry: any) => (
        <div key={entry.id} className="flex gap-3 items-start">
          <div className="mt-0.5">
            {getActionIcon(entry.tipo)}
          </div>
          <div className="flex-1">
            <p className="font-medium">{getActionText(entry)}</p>
            {entry.observacao && (
              <p className="text-sm text-muted-foreground">{entry.observacao}</p>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              {format(parseISO(entry.criado_em), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
