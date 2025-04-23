import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase, AppointmentWithDetails } from "@/lib/supabase";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { CalendarIcon, List, LayoutGrid, Loader } from "lucide-react";
import { cn, formatDate } from "@/lib/utils";
import { format, addDays, startOfWeek, endOfWeek, eachDayOfInterval, isToday, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

const WeeklySchedule = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewType, setViewType] = useState<"grid" | "list">("grid");
  const [professionalFilter, setProfessionalFilter] = useState<string>("all");
  
  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 0 });
  const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 0 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const timeSlots = Array.from({ length: 21 }, (_, i) => {
    const hour = Math.floor(i / 2) + 8;
    const minute = (i % 2) * 30;
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  });

  const { data: professionals } = useQuery({
    queryKey: ["professionals"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profissionais")
        .select("*")
        .order("nome");
      
      if (error) throw error;
      return data || [];
    },
  });

  const { data: appointments, isLoading } = useQuery({
    queryKey: ["week-appointments", format(weekStart, "yyyy-MM-dd"), format(weekEnd, "yyyy-MM-dd"), professionalFilter],
    queryFn: async () => {
      let query = supabase
        .from("agendamentos")
        .select(`
          *,
          cliente:clientes(*),
          servico:servicos(*),
          profissional:profissionais(*)
        `)
        .gte("data", format(weekStart, "yyyy-MM-dd"))
        .lte("data", format(weekEnd, "yyyy-MM-dd"))
        .neq("status", "cancelado");
      
      if (professionalFilter !== "all") {
        query = query.eq("profissional_id", professionalFilter);
      }
      
      const { data, error } = await query.order("data").order("hora");
      
      if (error) throw error;
      return data || [];
    },
  });

  const getAppointmentsForDayAndTime = (day: Date, time: string) => {
    if (!appointments) return [];
    
    const formattedDay = format(day, "yyyy-MM-dd");
    return appointments.filter(
      (appointment: any) => 
        appointment.data === formattedDay && 
        appointment.hora === time
    );
  };

  const getAppointmentsForDay = (day: Date) => {
    if (!appointments) return [];
    
    const formattedDay = format(day, "yyyy-MM-dd");
    return appointments.filter(
      (appointment: any) => appointment.data === formattedDay
    );
  };

  const renderGridView = () => (
    <div className="overflow-x-auto">
      <div className="min-w-[900px]">
        <div className="grid grid-cols-8 gap-2 mb-2">
          <div className="font-semibold text-sm p-2 bg-gray-100 rounded"></div>
          {weekDays.map((day) => (
            <div 
              key={day.toString()} 
              className={cn(
                "font-semibold text-sm p-2 rounded text-center",
                isToday(day) ? "bg-primary/20" : "bg-gray-100"
              )}
            >
              <div>{format(day, "EEE", { locale: ptBR })}</div>
              <div>{format(day, "dd/MM")}</div>
            </div>
          ))}
        </div>

        {timeSlots.map((time) => (
          <div key={time} className="grid grid-cols-8 gap-2 mb-2">
            <div className="text-xs font-medium p-2 bg-gray-50 rounded flex items-center justify-center">
              {time}
            </div>
            
            {weekDays.map((day) => {
              const dayAppointments = getAppointmentsForDayAndTime(day, time);
              
              return (
                <div 
                  key={day.toString()} 
                  className={cn(
                    "p-1 rounded min-h-[60px] text-xs transition-colors border",
                    dayAppointments.length > 0 
                      ? "border-primary/30 bg-primary/5" 
                      : "border-gray-200"
                  )}
                >
                  {dayAppointments.map((appointment: any) => (
                    <div 
                      key={appointment.id}
                      className="bg-white p-2 rounded shadow-sm mb-1 border-l-2 border-primary"
                    >
                      <div className="font-semibold truncate">{appointment.cliente.nome}</div>
                      <div className="text-gray-600 truncate">{appointment.servico.nome}</div>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );

  const renderListView = () => (
    <div className="space-y-6">
      {weekDays.map((day) => {
        const dayAppointments = getAppointmentsForDay(day);
        const formattedDay = formatDate(day);
        const isCurrentDay = isToday(day);
        
        return (
          <div key={day.toString()}>
            <h3 className={cn(
              "font-semibold mb-3 pb-2 border-b",
              isCurrentDay ? "text-primary" : ""
            )}>
              {isCurrentDay ? "Hoje - " : ""}{formattedDay}
            </h3>
            
            {dayAppointments.length === 0 ? (
              <div className="text-gray-500 py-3 text-center">
                Nenhum agendamento para este dia
              </div>
            ) : (
              <div className="space-y-2">
                {dayAppointments.map((appointment: any) => (
                  <div 
                    key={appointment.id}
                    className="p-3 border rounded-lg bg-white shadow-sm"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-semibold text-lg">{appointment.hora}</div>
                        <div>{appointment.cliente.nome}</div>
                        <div className="text-gray-600">{appointment.servico.nome}</div>
                      </div>
                      <div className="text-sm text-gray-500">
                        <div>{appointment.profissional.nome}</div>
                        <div>{appointment.servico.duracao_em_minutos} min</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold mb-2 font-playfair">Agenda Semanal</h1>
        <p className="text-muted-foreground">
          Visualize os agendamentos da semana
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <CardTitle>Agenda da Semana</CardTitle>
            
            <div className="flex items-center space-x-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="justify-start text-left"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(selectedDate, "dd/MM/yyyy")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 pointer-events-auto">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
                    initialFocus
                    locale={ptBR}
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>

              <Select value={professionalFilter} onValueChange={setProfessionalFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Profissional" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os profissionais</SelectItem>
                  {professionals?.map((pro: any) => (
                    <SelectItem key={pro.id} value={pro.id}>
                      {pro.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Tabs value={viewType} onValueChange={(v) => setViewType(v as "grid" | "list")}>
                <TabsList>
                  <TabsTrigger value="grid">
                    <LayoutGrid className="h-4 w-4 mr-1" /> Grade
                  </TabsTrigger>
                  <TabsTrigger value="list">
                    <List className="h-4 w-4 mr-1" /> Lista
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              {viewType === "grid" ? renderGridView() : renderListView()}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default WeeklySchedule;
