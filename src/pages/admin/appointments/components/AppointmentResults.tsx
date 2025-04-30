
import { Loader } from "lucide-react";
import { AppointmentWithDetails } from "@/types/appointment.types";
import { AppointmentList } from "@/components/appointment/AppointmentList";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface AppointmentResultsProps {
  isLoading: boolean;
  appointments: AppointmentWithDetails[];
  onAppointmentUpdated: () => void;
  showAll: boolean;
  statusFilter: string;
}

export function AppointmentResults({
  isLoading,
  appointments,
  onAppointmentUpdated,
  showAll,
  statusFilter
}: AppointmentResultsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Resultados</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <AppointmentList 
            appointments={appointments}
            onAppointmentUpdated={onAppointmentUpdated}
            showAll={showAll}
            statusFilter={statusFilter}
          />
        )}
      </CardContent>
    </Card>
  );
}
