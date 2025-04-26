
import { formatLocalDate } from "@/lib/dateUtils";

interface DateTimeSummaryProps {
  date: string;
  time: string;
}

const DateTimeSummary = ({ date, time }: DateTimeSummaryProps) => {
  return (
    <div>
      <h3 className="font-medium">Data e Hora</h3>
      <p>
        {formatLocalDate(date)} às {time}
      </p>
    </div>
  );
};

export default DateTimeSummary;
