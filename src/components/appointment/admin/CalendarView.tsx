import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Calendar } from "@/components/ui/calendar";
import { format, startOfMonth, endOfMonth, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { AppointmentWithDetails } from "@/types/appointment.types";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { DayProps } from "react-day-picker";

export function CalendarView() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showAppointments, setShowAppointments] = useState(false);
  const { toast } = useToast();

  const { data: monthAppointments, isLoading } = useQuery({
    queryKey: ["calendar-appointments", format(selectedDate, "yyyy-MM")],
    queryFn: async () => {
      const startDate = format(startOfMonth(selectedDate), "yyyy-MM-dd");
      const endDate = format(endOfMonth(selectedDate), "yyyy-MM-dd");
      
      try {
        const { data, error } = await supabase
          .from("agendamentos")
          .select(`
            *,
            cliente:clientes(*),
            servico:servicos(*),
            profissional:profissionais(*)
          `)
          .gte("data", startDate)
          .lte("data", endDate);
        
        if (error) throw error;
        return data || [];
      } catch (err) {
        console.error("❌ Failed to fetch calendar appointments:", err);
        toast({
          variant: "destructive",
          title: "Erro ao carregar agendamentos",
          description: "Não foi possível carregar os agendamentos do mês."
        });
        return [];
      }
    },
  });

  // Get appointments for the selected date
  const appointmentsForSelectedDate = monthAppointments?.filter((appointment: AppointmentWithDetails) => 
    isSameDay(new Date(appointment.data), selectedDate)
  ) || [];

  // Function to get the count of appointments per day
  const getAppointmentCountForDate = (date: Date) => {
    if (!monthAppointments) return 0;
    return monthAppointments.filter((appointment: AppointmentWithDetails) => 
      isSameDay(new Date(appointment.data), date)
    ).length;
  };

  // Function to get status counts for the selected date
  const getStatusCounts = () => {
    const statusCounts = {
      agendado: 0,
      concluido: 0,
      cancelado: 0
    };
    
    appointmentsForSelectedDate.forEach((appointment: AppointmentWithDetails) => {
      if (statusCounts[appointment.status as keyof typeof statusCounts] !== undefined) {
        statusCounts[appointment.status as keyof typeof statusCounts]++;
      }
    });
    
    return statusCounts;
  };

  const statusCounts = getStatusCounts();

  // Custom day render function for the calendar - Fixed to accept DayProps
  const renderDay = (props: DayProps) => {
    // Extract the date from props
    const day = props.date;
    const appointmentCount = getAppointmentCountForDate(day);
    
    return (
      <div className="relative w-full h-full">
        <div>{format(day, "d")}</div>
        {appointmentCount > 0 && (
          <Badge 
            className="absolute bottom-0 right-0 text-xs"
            variant={isSameDay(day, selectedDate) ? "default" : "outline"}
          >
            {appointmentCount}
          </Badge>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Calendário de Agendamentos</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="flex flex-col lg:flex-row gap-6">
              <div className="lg:w-2/3">
                <Calendar 
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  locale={ptBR}
                  className="rounded-md border p-3 pointer-events-auto"
                  components={{ Day: renderDay }}
                />
              </div>
              
              <div className="lg:w-1/3 space-y-4">
                <Card>
                  <CardHeader className="py-3">
                    <CardTitle className="text-lg">
                      {format(selectedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="py-2">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span>Total de agendamentos:</span>
                        <Badge variant="outline">{appointmentsForSelectedDate.length}</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Agendados:</span>
                        <Badge variant="outline" className="bg-blue-100 text-blue-800">
                          {statusCounts.agendado}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Concluídos:</span>
                        <Badge variant="outline" className="bg-green-100 text-green-800">
                          {statusCounts.concluido}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Cancelados:</span>
                        <Badge variant="outline" className="bg-red-100 text-red-800">
                          {statusCounts.cancelado}
                        </Badge>
                      </div>
                    </div>
                    
                    {appointmentsForSelectedDate.length > 0 && (
                      <Button 
                        onClick={() => setShowAppointments(true)}
                        className="w-full mt-4"
                      >
                        Ver Agendamentos
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog to show appointments for the selected date */}
      <Dialog open={showAppointments} onOpenChange={setShowAppointments}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              Agendamentos - {format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}
            </DialogTitle>
            <DialogDescription>
              Lista de todos os agendamentos para esta data.
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="max-h-[60vh]">
            <div className="space-y-4 p-1">
              {appointmentsForSelectedDate.length === 0 ? (
                <p className="text-center py-4 text-muted-foreground">
                  Nenhum agendamento encontrado para esta data.
                </p>
              ) : (
                appointmentsForSelectedDate
                  .sort((a, b) => a.hora.localeCompare(b.hora))
                  .map((appointment: AppointmentWithDetails) => {
                    const statusColors = {
                      agendado: "bg-blue-100 text-blue-800",
                      concluido: "bg-green-100 text-green-800",
                      cancelado: "bg-red-100 text-red-800",
                    };
                    
                    return (
                      <Card key={appointment.id} className="overflow-hidden">
                        <div className="flex border-l-4 border-primary">
                          <div className="bg-muted p-3 flex items-center justify-center w-20">
                            <p className="text-center font-bold">{appointment.hora}</p>
                          </div>
                          
                          <div className="flex-1 p-3">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-medium">{appointment.cliente.nome}</p>
                                <p className="text-sm text-muted-foreground">
                                  {appointment.servico.nome} • {appointment.profissional.nome}
                                </p>
                              </div>
                              <Badge className={statusColors[appointment.status as keyof typeof statusColors]}>
                                {appointment.status === "agendado" ? "Agendado" : 
                                 appointment.status === "concluido" ? "Concluído" : "Cancelado"}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </Card>
                    );
                  })
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}
