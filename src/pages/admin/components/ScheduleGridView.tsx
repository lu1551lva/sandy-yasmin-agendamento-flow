
import { cn, formatDate } from "@/lib/utils";
import { format, isToday } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Props {
  weekDays: Date[];
  timeSlots: string[];
  getAppointmentsForDayAndTime: (day: Date, time: string) => any[];
}

const ScheduleGridView = ({
  weekDays,
  timeSlots,
  getAppointmentsForDayAndTime,
}: Props) => {
  return (
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
              <div>{format(day, "EEEE", { locale: ptBR })}</div>
              <div>{format(day, "dd/MM", { locale: ptBR })}</div>
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
                      <div className="font-semibold truncate">{appointment.cliente?.nome || "Cliente não encontrado"}</div>
                      <div className="text-gray-600 truncate">{appointment.servico?.nome || "Serviço não encontrado"}</div>
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
};

export default ScheduleGridView;
