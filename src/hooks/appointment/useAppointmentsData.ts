
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { format } from "date-fns";
import { AppointmentWithDetails } from "@/types/appointment.types";

export function useAppointmentsData() {
  // State for filters
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [professionalFilter, setProfessionalFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch appointments
  const { 
    data: appointments = [], 
    isLoading, 
    refetch,
    error
  } = useQuery({
    queryKey: ["appointments", selectedDate, statusFilter, professionalFilter, searchQuery],
    queryFn: async () => {
      try {
        console.log("Fetching appointments with filters:", { 
          date: format(selectedDate, "yyyy-MM-dd"),
          status: statusFilter, 
          professional: professionalFilter,
          search: searchQuery
        });
        
        let query = supabase
          .from("agendamentos")
          .select(`
            *,
            cliente:clientes(*),
            servico:servicos(*),
            profissional:profissionais(*)
          `);
        
        // Apply date filter if date is selected
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
        
        const { data, error } = await query.order("hora");
        
        if (error) {
          console.error("Error fetching appointments:", error);
          throw error;
        }
        
        // Apply search filter on client side if needed
        if (searchQuery && data) {
          const lowerQuery = searchQuery.toLowerCase();
          return data.filter((appt: any) => 
            appt.cliente.nome?.toLowerCase().includes(lowerQuery) ||
            appt.cliente.telefone?.includes(searchQuery) ||
            appt.cliente.email?.toLowerCase().includes(lowerQuery) ||
            appt.servico.nome?.toLowerCase().includes(lowerQuery)
          );
        }
        
        return data || [];
      } catch (err) {
        console.error("Failed to fetch appointments:", err);
        throw err;
      }
    },
    refetchOnWindowFocus: true,
  });

  // Fetch professionals for filter
  const { data: professionals = [] } = useQuery({
    queryKey: ["professionals"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("profissionais")
          .select("*")
          .order("nome");
        
        if (error) throw error;
        return data || [];
      } catch (err) {
        console.error("Failed to fetch professionals:", err);
        return [];
      }
    },
  });

  return {
    // Filter state
    selectedDate,
    setSelectedDate,
    statusFilter,
    setStatusFilter,
    professionalFilter,
    setProfessionalFilter,
    searchQuery,
    setSearchQuery,
    
    // Data
    appointments: appointments as AppointmentWithDetails[],
    professionals,
    isLoading,
    error,
    
    // Actions
    refetch,
  };
}
