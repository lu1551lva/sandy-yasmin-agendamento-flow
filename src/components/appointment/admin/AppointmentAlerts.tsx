
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Clock, AlertCircle, Check, CalendarClock } from "lucide-react";
import { format, isToday, parseISO, isBefore } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { AppointmentWithDetails } from "@/types/appointment.types";
import { useToast } from "@/hooks/use-toast";

export function AppointmentAlerts() {
  const [showAll, setShowAll] = useState(false);
  const { toast } = useToast();
  
  // Get today's date in YYYY-MM-DD format
  const today = format(new Date(), "yyyy-MM-dd");
  
  // Query for today's appointments and late appointments
  const { data: appointments = [], isLoading } = useQuery({
    queryKey: ["appointments-alerts"],
    queryFn: async () => {
      try {
        // Get today's scheduled appointments
        const { data: todayAppointments, error: todayError } = await supabase
          .from("agendamentos")
          .select(`
            *,
            cliente:clientes(*),
            servico:servicos(*),
            profissional:profissionais(*)
          `)
          .eq("data", today)
          .eq("status", "agendado");
          
        if (todayError) throw todayError;
        
        // Get overdue appointments (past dates that are still scheduled)
        const { data: overdueAppointments, error: overdueError } = await supabase
          .from("agendamentos")
          .select(`
            *,
            cliente:clientes(*),
            servico:servicos(*),
            profissional:profissionais(*)
          `)
          .lt("data", today)
          .eq("status", "agendado");
          
        if (overdueError) throw overdueError;
        
        return [...(todayAppointments || []), ...(overdueAppointments || [])];
      } catch (err) {
        console.error("❌ Failed to fetch appointment alerts:", err);
        toast({
          variant: "destructive",
          title: "Erro ao carregar alertas",
          description: "Não foi possível carregar os alertas de agendamentos."
        });
        return [];
      }
    },
  });

  // Filter overdue appointments
  const overdueAppointments = appointments.filter((appointment: AppointmentWithDetails) => 
    isBefore(parseISO(appointment.data), new Date()) && !isToday(parseISO(appointment.data))
  );
  
  // Filter late appointments for today
  const lateAppointments = appointments.filter((appointment: AppointmentWithDetails) => {
    if (!isToday(parseISO(appointment.data))) return false;
    
    const [hours, minutes] = appointment.hora.split(":").map(Number);
    const appointmentTime = new Date();
    appointmentTime.setHours(hours, minutes, 0, 0);
    
    return isBefore(appointmentTime, new Date());
  });
  
  // Upcoming appointments (today but not late)
  const upcomingAppointments = appointments.filter((appointment: AppointmentWithDetails) => {
    if (!isToday(parseISO(appointment.data))) return false;
    
    const [hours, minutes] = appointment.hora.split(":").map(Number);
    const appointmentTime = new Date();
    appointmentTime.setHours(hours, minutes, 0, 0);
    
    return !isBefore(appointmentTime, new Date());
  });
  
  // Get the alerts based on the state
  const alerts = [
    ...overdueAppointments.map((appointment: AppointmentWithDetails) => ({
      id: appointment.id,
      type: "overdue" as const,
      appointment
    })),
    ...lateAppointments.map((appointment: AppointmentWithDetails) => ({
      id: appointment.id,
      type: "late" as const,
      appointment
    })),
    ...upcomingAppointments.map((appointment: AppointmentWithDetails) => ({
      id: appointment.id,
      type: "upcoming" as const,
      appointment
    }))
  ];
  
  // If not showing all, limit to 3 alerts
  const displayedAlerts = showAll ? alerts : alerts.slice(0, 3);
  
  // If no alerts and no loading, return null
  if (!isLoading && alerts.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {displayedAlerts.map((alert) => {
        const appointment = alert.appointment;
        
        let icon;
        let title;
        let variant: "default" | "destructive" = "default";
        
        switch (alert.type) {
          case "overdue":
            icon = <AlertCircle className="h-4 w-4" />;
            title = "Agendamento em atraso";
            variant = "destructive";
            break;
          case "late":
            icon = <Clock className="h-4 w-4" />;
            title = "Agendamento atrasado hoje";
            variant = "destructive";
            break;
          case "upcoming":
            icon = <CalendarClock className="h-4 w-4" />;
            title = "Agendamento para hoje";
            break;
        }
        
        return (
          <Alert key={alert.id} variant={variant}>
            <div className="flex items-center gap-2">
              {icon}
              <AlertTitle>{title}</AlertTitle>
            </div>
            <AlertDescription className="mt-2">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <div>
                  <span className="font-medium">Cliente:</span> {appointment.cliente.nome}
                </div>
                <div>
                  <span className="font-medium">Horário:</span> {appointment.data} às {appointment.hora}
                </div>
                <div>
                  <span className="font-medium">Serviço:</span> {appointment.servico.nome}
                </div>
              </div>
            </AlertDescription>
          </Alert>
        );
      })}
      
      {alerts.length > 3 && (
        <div className="flex justify-center">
          <Button 
            variant="outline" 
            onClick={() => setShowAll(!showAll)}
          >
            {showAll ? (
              <>
                <Check className="mr-2 h-4 w-4" />
                Ocultar
              </>
            ) : (
              <>
                Ver todos ({alerts.length})
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
