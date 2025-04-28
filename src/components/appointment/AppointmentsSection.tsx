
import { AppointmentWithDetails } from "@/types/appointment.types";
import { AppointmentCard } from "./AppointmentCard";

interface AppointmentsSectionProps {
  title: string;
  titleClassName: string;
  appointments: AppointmentWithDetails[];
  onShowDetails: (appointment: AppointmentWithDetails) => void;
  onComplete: (appointmentId: string) => void;
  onCancel: (appointmentId: string) => void;
  isLoading: boolean;
}

export function AppointmentsSection({
  title,
  titleClassName,
  appointments,
  onShowDetails,
  onComplete,
  onCancel,
  isLoading
}: AppointmentsSectionProps) {
  // Se não houver agendamentos, não renderizar a seção
  if (appointments.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h3 className={`text-lg font-medium ${titleClassName}`}>{title}</h3>
      <div className="space-y-3">
        {appointments.map((appointment) => (
          <AppointmentCard
            key={appointment.id}
            appointment={appointment}
            onShowDetails={onShowDetails}
            onComplete={onComplete}
            onCancel={onCancel}
            isLoading={isLoading}
          />
        ))}
      </div>
    </div>
  );
}
