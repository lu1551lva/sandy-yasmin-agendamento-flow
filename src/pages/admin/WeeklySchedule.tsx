
import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import HolidayManager from "./components/HolidayManager";
import { useWeeklyAppointments } from "./hooks/useWeeklyAppointments";
import ScheduleHeader from "./components/ScheduleHeader";
import ScheduleGridView from "./components/ScheduleGridView";
import ScheduleListView from "./components/ScheduleListView";

const WeeklySchedule = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewType, setViewType] = useState<"grid" | "list">("grid");
  const [professionalFilter, setProfessionalFilter] = useState<string>("all");
  const [showHolidayManager, setShowHolidayManager] = useState(false);

  const {
    professionals,
    appointments,
    isLoading,
    weekStart,
    weekEnd,
    weekDays,
    timeSlots,
    getAppointmentsForDayAndTime,
    getAppointmentsForDay
  } = useWeeklyAppointments({ selectedDate, professionalFilter });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold mb-2 font-playfair">
          Agenda Semanal
        </h1>
        <p className="text-muted-foreground">
          Visualize os agendamentos da semana
        </p>
      </div>

      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => setShowHolidayManager(!showHolidayManager)}
        >
          {showHolidayManager
            ? "Fechar Gerenciador de Feriados"
            : "Gerenciar Feriados"}
        </Button>
      </div>

      {showHolidayManager && <HolidayManager />}

      <Card>
        <CardHeader>
          <ScheduleHeader
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            professionals={professionals}
            professionalFilter={professionalFilter}
            setProfessionalFilter={setProfessionalFilter}
            viewType={viewType}
            setViewType={setViewType}
          />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-12">
              <span className="animate-spin text-primary h-8 w-8">⏳</span>
            </div>
          ) : (
            <>
              {viewType === "grid" ? (
                <ScheduleGridView
                  weekDays={weekDays}
                  timeSlots={timeSlots}
                  getAppointmentsForDayAndTime={getAppointmentsForDayAndTime}
                />
              ) : (
                <ScheduleListView
                  weekDays={weekDays}
                  getAppointmentsForDay={getAppointmentsForDay}
                />
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default WeeklySchedule;
