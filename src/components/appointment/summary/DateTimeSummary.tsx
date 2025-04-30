
import { formatLocalDate } from "@/lib/dateUtils";

interface DateTimeSummaryProps {
  date: string;
  time: string;
}

const DateTimeSummary = ({ date, time }: DateTimeSummaryProps) => {
  // Format date in Brazilian style: dd/mm/yyyy
  const formatDateBrazilian = (dateString: string) => {
    if (!dateString) return '';
    
    const parts = dateString.split('-');
    if (parts.length !== 3) return dateString;
    
    // Convert from YYYY-MM-DD to DD/MM/YYYY
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  };

  return (
    <div>
      <h3 className="font-medium">Data e Hora</h3>
      <p>
        {time} - {formatDateBrazilian(date)}
      </p>
    </div>
  );
};

export default DateTimeSummary;
