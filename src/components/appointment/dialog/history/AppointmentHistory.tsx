
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { formatDate } from "@/lib/dateUtils";
import { Loader2 } from "lucide-react";

interface HistoryEntry {
  id: string;
  created_at: string;
  agendamento_id: string;
  status_anterior: string;
  status_novo: string;
  motivo?: string;
  usuario?: string;
}

interface AppointmentHistoryProps {
  appointmentId: string;
}

export function AppointmentHistory({ appointmentId }: AppointmentHistoryProps) {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchHistory() {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from("historico_agendamentos")
          .select("*")
          .eq("agendamento_id", appointmentId)
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Erro ao buscar histórico:", error);
          throw error;
        }

        setHistory(data || []);
      } catch (error) {
        console.error("Erro ao buscar histórico:", error);
      } finally {
        setIsLoading(false);
      }
    }

    if (appointmentId) {
      fetchHistory();
    }
  }, [appointmentId]);

  // Helper to format status
  const formatStatus = (status: string) => {
    switch (status) {
      case "agendado":
        return "Agendado";
      case "concluido":
        return "Concluído";
      case "cancelado":
        return "Cancelado";
      default:
        return status;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        <p>Nenhum histórico disponível para este agendamento.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground mb-2">
        Mostrando histórico de alterações de status
      </div>
      <div className="space-y-4">
        {history.map((entry) => (
          <div
            key={entry.id}
            className="border rounded-md p-4 space-y-2"
          >
            <div className="flex justify-between items-center">
              <div>
                <span className="font-medium">
                  {formatStatus(entry.status_anterior)} → {formatStatus(entry.status_novo)}
                </span>
              </div>
              <div className="text-sm text-muted-foreground">
                {new Date(entry.created_at).toLocaleString("pt-BR")}
              </div>
            </div>
            {entry.motivo && (
              <div className="text-sm mt-1">
                <span className="text-muted-foreground">Motivo: </span>
                <span>{entry.motivo}</span>
              </div>
            )}
            {entry.usuario && (
              <div className="text-sm mt-1">
                <span className="text-muted-foreground">Usuário: </span>
                <span>{entry.usuario}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
