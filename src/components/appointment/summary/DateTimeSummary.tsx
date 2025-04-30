
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

interface DateTimeSummaryProps {
  date: string;
  time: string;
}

const DateTimeSummary = ({ date, time }: DateTimeSummaryProps) => {
  // Format date in Brazilian style: dd/mm/yyyy
  const formatDateBrazilian = (dateString: string) => {
    if (!dateString) return '';
    
    try {
      if (dateString.includes('-')) {
        // Convert from YYYY-MM-DD to DD/MM/YYYY
        const date = parseISO(dateString);
        return format(date, "dd/MM/yyyy", { locale: ptBR });
      }
    } catch (error) {
      console.error("Error parsing date:", error);
    }
    
    // Fallback to basic formatting
    const parts = dateString.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    
    return dateString;
  };

  return (
    <div>
      <h3 className="font-medium">Data e Hora</h3>
      <p>
        <span className="font-medium">{time}</span> - {formatDateBrazilian(date)}
      </p>
    </div>
  );
};

export default DateTimeSummary;
