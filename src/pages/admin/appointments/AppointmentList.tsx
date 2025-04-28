
import { AppointmentPageHeader } from "./components/AppointmentPageHeader";
import { AppointmentFilters } from "./components/AppointmentFilters";
import { AppointmentResults } from "./components/AppointmentResults";
import { useAppointmentsData } from "./hooks/useAppointmentsData";

const AppointmentList = () => {
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
      
      <AppointmentResults 
        isLoading={isLoading}
        appointments={appointments}
        onAppointmentUpdated={handleAppointmentUpdated}
        showAll={showAll}
      />
    </div>
  );
};

export default AppointmentList;
