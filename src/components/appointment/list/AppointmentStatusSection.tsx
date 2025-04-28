
import { AppointmentWithDetails } from "@/types/appointment.types";
import { AppointmentCard } from "../AppointmentCard";

interface AppointmentStatusSectionProps {
  title: string;
  titleClassName: string;
  appointments: AppointmentWithDetails[];
  onShowDetails: (appointment: AppointmentWithDetails) => void;
  onComplete: (appointmentId: string) => void;
  onCancel: (appointmentId: string) => void;
  isLoading: boolean;
}

export function AppointmentStatusSection({
  title,
  titleClassName,
  appointments,
  onShowDetails,
  onComplete,
  onCancel,
  isLoading
}: AppointmentStatusSectionProps) {
  // If no appointments, don't render the section
  if (!appointments || appointments.length === 0) {
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
