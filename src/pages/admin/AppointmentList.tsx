
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AppointmentList as AppointmentListComponent } from "@/components/appointment/AppointmentList";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon, Loader } from "lucide-react";
import { AppointmentWithDetails } from "@/types/appointment.types";

const AppointmentList = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [professionalFilter, setProfessionalFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch appointments
  const { data: appointments, isLoading, refetch } = useQuery({
    queryKey: ["appointments", selectedDate, statusFilter, professionalFilter, searchQuery],
    queryFn: async () => {
      let query = supabase
        .from("agendamentos")
        .select(`
          *,
          cliente:clientes(*),
          servico:servicos(*),
          profissional:profissionais(*)
        `);
      
      // Apply date filter
      if (selectedDate) {
        query = query.eq("data", format(selectedDate, "yyyy-MM-dd"));
      }
      
      // Apply status filter
      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }
      
      // Apply professional filter
      if (professionalFilter !== "all") {
        query = query.eq("profissional_id", professionalFilter);
      }
      
      // Execute query
      const { data, error } = await query.order("hora");
      
      if (error) throw error;
      
      // Apply search filter on client side
      if (searchQuery) {
        const lowerQuery = searchQuery.toLowerCase();
        return (data || []).filter((appt: any) => 
          appt.cliente.nome.toLowerCase().includes(lowerQuery) ||
          appt.cliente.telefone.includes(searchQuery) ||
          appt.cliente.email?.toLowerCase().includes(lowerQuery) ||
          appt.servico.nome.toLowerCase().includes(lowerQuery)
        );
      }
      
      return data || [];
    },
  });

  // Fetch professionals for filter
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

  // Handle appointment update
  const handleAppointmentUpdated = () => {
    refetch();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold mb-2 font-playfair">Agendamentos</h1>
        <p className="text-muted-foreground">
          Gerencie todos os agendamentos do salão
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Date filter */}
            <div>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? (
                      format(selectedDate, "dd/MM/yyyy")
                    ) : (
                      <span>Escolha uma data</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 pointer-events-auto">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    initialFocus
                    locale={ptBR}
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Status filter */}
            <div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="agendado">Agendado</SelectItem>
                  <SelectItem value="concluido">Concluído</SelectItem>
                  <SelectItem value="cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Professional filter */}
            <div>
              <Select value={professionalFilter} onValueChange={setProfessionalFilter}>
                <SelectTrigger>
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
            </div>

            {/* Search */}
            <div>
              <Input
                placeholder="Buscar cliente ou serviço..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Appointments list */}
      <Card>
        <CardHeader>
          <CardTitle>Resultados</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <AppointmentListComponent 
              appointments={appointments as AppointmentWithDetails[]}
              onAppointmentUpdated={handleAppointmentUpdated}
              showAll={statusFilter === "all" || statusFilter === "cancelado"}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AppointmentList;
