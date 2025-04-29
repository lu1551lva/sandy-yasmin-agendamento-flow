
import { useState } from "react";
import { RescheduleDialog } from "@/components/appointment/RescheduleDialog";
import { AppointmentWithDetails } from "@/types/appointment.types";
import { Loader2 } from "lucide-react";

interface AppointmentRescheduleDialogProps {
  appointment: AppointmentWithDetails | null;
  isOpen: boolean;
  onClose: () => void;
  onReschedule: (date: Date, time: string) => Promise<void>;
  isLoading: boolean;
}

export function AppointmentRescheduleDialog({
  appointment,
  isOpen,
  onClose,
  onReschedule,
  isLoading
}: AppointmentRescheduleDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleReschedule = async (date: Date, time: string) => {
    try {
      setIsSubmitting(true);
      await onReschedule(date, time);
    } catch (error) {
      console.error("Error during reschedule:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Show loading state if appointment is missing
  if (!appointment && isOpen) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!appointment) return null;
  
  return (
    <RescheduleDialog
      appointment={appointment}
      isOpen={isOpen}
      onClose={onClose}
      onReschedule={handleReschedule}
      isLoading={isLoading || isSubmitting}
    />
  );
}
