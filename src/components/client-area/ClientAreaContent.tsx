
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Client } from "@/lib/supabase";
import { AppointmentWithDetails } from "@/types/appointment.types";
import { DataTablePagination } from "@/components/common/DataTablePagination";
import { User } from "lucide-react";
import { ReviewForm } from "@/components/reviews/ReviewForm";
import { AppointmentCard } from "./AppointmentCard";
import { ClientProfile } from "./ClientProfile";

interface ClientAreaContentProps {
  client: Client;
  appointments: AppointmentWithDetails[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onLogout: () => void;
}

export const ClientAreaContent = ({
  client,
  appointments,
  currentPage,
  totalPages,
  onPageChange,
  onLogout
}: ClientAreaContentProps) => {
  const [viewingAppointment, setViewingAppointment] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" /> 
            Olá, {client.nome}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="appointments">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="appointments">Meus Agendamentos</TabsTrigger>
              <TabsTrigger value="profile">Meu Perfil</TabsTrigger>
            </TabsList>
            
            <TabsContent value="appointments" className="mt-4">
              {viewingAppointment ? (
                <div className="space-y-4">
                  <Button 
                    variant="ghost" 
                    onClick={() => setViewingAppointment(null)}
                  >
                    ← Voltar
                  </Button>
                  
                  <h3 className="text-lg font-semibold">Sua avaliação</h3>
                  <ReviewForm 
                    appointmentId={viewingAppointment} 
                    onSuccess={() => setViewingAppointment(null)} 
                  />
                </div>
              ) : (
                <>
                  {appointments.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      Nenhum agendamento encontrado
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {appointments.map((appointment) => (
                        <AppointmentCard
                          key={appointment.id}
                          appointment={appointment}
                          onReviewClick={setViewingAppointment}
                        />
                      ))}
                      
                      {totalPages > 1 && (
                        <DataTablePagination
                          currentPage={currentPage}
                          totalPages={totalPages}
                          onPageChange={onPageChange}
                        />
                      )}
                    </div>
                  )}
                </>
              )}
            </TabsContent>
            
            <TabsContent value="profile" className="mt-4">
              <ClientProfile client={client} onLogout={onLogout} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
