
import { AppointmentList } from "@/components/appointment/AppointmentList";
import { useAppointmentsData } from "./appointments/hooks/useAppointmentsData";
import { AppointmentFilters } from "./appointments/components/AppointmentFilters";
import { AppointmentPageHeader } from "./appointments/components/AppointmentPageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader } from "lucide-react";

const AppointmentListPage = () => {
  const {
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
    appointments,
    professionals,
    isLoading,
    error,
    
    // Actions
    handleAppointmentUpdated,
    
    // Computed values
    showAll
  } = useAppointmentsData();

  return (
    <div className="space-y-6">
      <AppointmentPageHeader 
        title="Agendamentos"
        description="Gerencie todos os agendamentos do salão"
      />
      
      <AppointmentFilters 
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        professionalFilter={professionalFilter}
        setProfessionalFilter={setProfessionalFilter}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        professionals={professionals}
        isLoading={isLoading}
      />
      
      <Card>
        <CardHeader>
          <CardTitle>Agendamentos</CardTitle>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="text-center py-8 text-red-500">
              Erro ao carregar agendamentos. Por favor, tente novamente.
            </div>
          ) : isLoading ? (
            <div className="flex justify-center py-12">
              <Loader className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <AppointmentList 
              appointments={appointments}
              onAppointmentUpdated={handleAppointmentUpdated}
              showAll={showAll}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AppointmentListPage;
