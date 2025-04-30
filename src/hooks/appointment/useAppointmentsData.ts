
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { format } from "date-fns";
import { AppointmentWithDetails } from "@/types/appointment.types";
import { useAppointmentCache } from "@/hooks/appointment/useAppointmentCache";

export function useAppointmentsData() {
  // Query client for manual cache operations
  const queryClient = useQueryClient();
  
  // State for filters
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [professionalFilter, setProfessionalFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Cache helpers
  const { forceRefetchAll } = useAppointmentCache();

  // Generate a stable query key that includes all filters
  const appointmentsQueryKey = [
    "appointments",
    selectedDate ? format(selectedDate, "yyyy-MM-dd") : null,
    statusFilter,
    professionalFilter,
    searchQuery
  ];

  // Fetch appointments
  const { 
    data: appointments = [], 
    isLoading, 
    refetch,
    error
  } = useQuery({
    queryKey: appointmentsQueryKey,
    queryFn: async () => {
      try {
        console.log("🔍 Fetching appointments with filters:", { 
          date: selectedDate ? format(selectedDate, "yyyy-MM-dd") : null,
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
        
        const { data, error } = await query.order("hora");
        
        if (error) {
          console.error("❌ Error fetching appointments:", error);
          throw error;
        }
        
        console.log(`✅ Retrieved ${data?.length || 0} appointments`);
        
        // Apply search filter on client side
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
        console.error("❌ Failed to fetch appointments:", err);
        throw err;
      }
    },
    // Disable stale time to always get fresh data
    staleTime: 0,
    // Ensure refetching when the component gains focus
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
        console.error("❌ Failed to fetch professionals:", err);
        return [];
      }
    },
  });

  // Handle appointment update
  const handleAppointmentUpdated = async () => {
    console.log("🔄 Appointment updated, refreshing data...");
    
    // First, force a complete cache refresh
    await forceRefetchAll();
    
    // Then, specific refetch for this page with current filters
    await refetch();
    
    // Also refresh dashboard data
    await queryClient.refetchQueries({ queryKey: ['dashboard-data'] });
    await queryClient.refetchQueries({ queryKey: ['upcoming-appointments'] });
    
    console.log("✅ Data refresh complete");
  };

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
    handleAppointmentUpdated,
    refetch,
    
    // Always show all sections, regardless of filter
    // This ensures all sections are visible but will be controlled by the AppointmentList component
    showAll: true
  };
}
