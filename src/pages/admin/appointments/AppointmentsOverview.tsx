
import { useState } from "react";
import { CalendarView } from "@/components/appointment/admin/CalendarView";
import { AppointmentAlerts } from "@/components/appointment/admin/AppointmentAlerts";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { AdminAppointmentList } from "@/components/appointment/admin/AdminAppointmentList";
import { useAutoCompleteAppointments } from "@/hooks/appointment/useAutoCompleteAppointments";

const AppointmentsOverview = () => {
  const [view, setView] = useState<string>("calendar");
  
  // Initialize auto-completion for past appointments
  useAutoCompleteAppointments();

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4">
        <h1 className="text-3xl font-bold tracking-tight">Visão Geral de Agendamentos</h1>
        <p className="text-muted-foreground">
          Visualize e gerencie todos os agendamentos em um só lugar
        </p>
      </div>

      <AppointmentAlerts />

      <Tabs defaultValue={view} onValueChange={setView} className="w-full">
        <TabsList className="grid grid-cols-2 mb-4">
          <TabsTrigger value="calendar">Calendário</TabsTrigger>
          <TabsTrigger value="list">Lista</TabsTrigger>
        </TabsList>
        
        <TabsContent value="calendar" className="mt-0">
          <CalendarView />
        </TabsContent>
        
        <TabsContent value="list" className="mt-0">
          <AdminAppointmentList />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AppointmentsOverview;
