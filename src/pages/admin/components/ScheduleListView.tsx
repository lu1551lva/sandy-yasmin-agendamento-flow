
import { format, isToday } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn, formatDate } from "@/lib/utils";

interface Props {
  weekDays: Date[];
  getAppointmentsForDay: (day: Date) => any[];
}

const ScheduleListView = ({
  weekDays,
  getAppointmentsForDay,
}: Props) => {
  return (
    <div className="space-y-6">
      {weekDays.map((day) => {
        const dayAppointments = getAppointmentsForDay(day);
        const formattedDay = formatDate(day);
        const isCurrentDay = isToday(day);
        const diaDaSemana = format(day, "EEEE", { locale: ptBR });

        return (
          <div key={day.toString()}>
            <h3
              className={cn(
                "font-semibold mb-3 pb-2 border-b",
                isCurrentDay ? "text-primary" : ""
              )}
            >
              {isCurrentDay ? "Hoje - " : ""}
              {diaDaSemana}, {formattedDay}
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
                        <div>{appointment.cliente?.nome || "Cliente não encontrado"}</div>
                        <div className="text-gray-600">{appointment.servico?.nome || "Serviço não encontrado"}</div>
                      </div>
                      <div className="text-sm text-gray-500">
                        <div>{appointment.profissional?.nome || "Profissional não encontrado"}</div>
                        <div>{appointment.servico?.duracao_em_minutos || "?"} min</div>
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
};

export default ScheduleListView;
