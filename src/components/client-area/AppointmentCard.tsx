
import { CalendarClock, CheckCircle, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate } from "@/lib/dateUtils";
import { formatCurrency } from "@/lib/supabase";
import { AppointmentWithDetails } from "@/types/appointment.types";

interface AppointmentCardProps {
  appointment: AppointmentWithDetails & { reviews?: any[] };
  onReviewClick: (appointmentId: string) => void;
}

export const AppointmentCard = ({ appointment, onReviewClick }: AppointmentCardProps) => {
  const hasReview = appointment.reviews && appointment.reviews.length > 0;

  return (
    <Card key={appointment.id}>
      <CardContent className="pt-6">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="font-semibold">
              {appointment.servico.nome}
            </h3>
            <p className="text-sm text-muted-foreground">
              Com {appointment.profissional.nome}
            </p>
          </div>
          <div className="text-right">
            <p className="font-medium">
              {formatCurrency(appointment.servico.valor)}
            </p>
            <p className="text-sm text-muted-foreground">
              {appointment.hora}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-1 text-sm mb-4">
          <CalendarClock className="h-4 w-4" />
          <span>{formatDate(new Date(appointment.data))}</span>
          <span className="ml-2 px-2 py-0.5 rounded-full text-xs bg-gray-100">
            {appointment.status === "concluido" ? "Concluído" : 
             appointment.status === "cancelado" ? "Cancelado" : 
             "Agendado"}
          </span>
        </div>
        
        {appointment.status === "concluido" && (
          <div className="mt-2">
            {hasReview ? (
              <div className="flex items-center gap-2 text-sm text-green-600">
                <CheckCircle className="h-4 w-4" />
                <span>Avaliação enviada</span>
              </div>
            ) : (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onReviewClick(appointment.id)}
                className="w-full"
              >
                <Star className="h-4 w-4 mr-2" />
                Avaliar Atendimento
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
