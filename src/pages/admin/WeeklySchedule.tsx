
import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import HolidayManager from "./components/HolidayManager";
import { useWeeklyAppointments } from "./hooks/useWeeklyAppointments";
import ScheduleHeader from "./components/ScheduleHeader";
import ScheduleGridView from "./components/ScheduleGridView";
import ScheduleListView from "./components/ScheduleListView";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

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

  // Format the date range for the header
  const dateRangeText = `${format(weekStart, "d 'de' MMMM", { locale: ptBR })} - ${format(weekEnd, "d 'de' MMMM", { locale: ptBR })}`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold mb-2 font-playfair">
          Agenda Semanal
        </h1>
        <p className="text-muted-foreground">
          {dateRangeText}
        </p>
      </div>

      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <Button
          variant="outline"
          onClick={() => setShowHolidayManager(!showHolidayManager)}
          className="w-full sm:w-auto"
        >
          {showHolidayManager
            ? "Fechar Gerenciador de Feriados"
            : "Gerenciar Feriados"}
        </Button>
        
        <div className="flex gap-2">
          <Button
            variant={viewType === "grid" ? "default" : "outline"}
            onClick={() => setViewType("grid")}
            className="flex-1 sm:flex-none"
          >
            Grade
          </Button>
          <Button
            variant={viewType === "list" ? "default" : "outline"}
            onClick={() => setViewType("list")}
            className="flex-1 sm:flex-none"
          >
            Lista
          </Button>
        </div>
      </div>

      {showHolidayManager && <HolidayManager />}

      <Card className="shadow-sm">
        <CardHeader className="pb-3">
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
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <>
              {viewType === "grid" ? (
                <div className="overflow-x-auto pb-4">
                  <ScheduleGridView
                    weekDays={weekDays}
                    timeSlots={timeSlots}
                    getAppointmentsForDayAndTime={getAppointmentsForDayAndTime}
                  />
                </div>
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
