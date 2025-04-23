import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase, Service, AppointmentWithDetails } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Check, Loader, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatDate, formatTime, formatPhoneForWhatsApp, createWhatsAppLink } from "@/lib/utils";
import { format } from "date-fns";
import AppointmentSummary from "./AppointmentSummary";
import ConfirmationActions from "./ConfirmationActions";
import ConfirmationSuccess from "./ConfirmationSuccess";

interface ConfirmationProps {
  appointmentData: {
    service: Service | null;
    professional_id: string | null;
    date: Date | null;
    time: string | null;
    client: any; // Using any here as it might be partial during form input
  };
  isSubmitting: boolean;
  isComplete: boolean;
  setIsSubmitting: (value: boolean) => void;
  setIsComplete: (value: boolean) => void;
  prevStep: () => void;
}

const Confirmation = ({
  appointmentData,
  isSubmitting,
  isComplete,
  setIsSubmitting,
  setIsComplete,
  prevStep,
}: ConfirmationProps) => {
  const [appointmentId, setAppointmentId] = useState<string | null>(null);
  const { toast } = useToast();

  const { data: professional } = useQuery({
    queryKey: ["professional", appointmentData.professional_id],
    queryFn: async () => {
      if (!appointmentData.professional_id) return null;
      
      const { data, error } = await supabase
        .from("profissionais")
        .select("*")
        .eq("id", appointmentData.professional_id)
        .single();
      
      if (error) {
        toast({
          title: "Erro ao carregar profissional",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }
      return data;
    },
    enabled: !!appointmentData.professional_id,
  });

  const handleConfirm = async () => {
    if (!appointmentData.service || !appointmentData.date || 
        !appointmentData.time || !appointmentData.client || 
        !appointmentData.professional_id) {
      toast({
        title: "Dados incompletos",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const formattedDate = format(appointmentData.date, "yyyy-MM-dd");

      const { data: existingAppointments, error: checkError } = await supabase
        .from("agendamentos")
        .select("*")
        .eq("data", formattedDate)
        .eq("hora", appointmentData.time)
        .eq("profissional_id", appointmentData.professional_id)
        .in("status", ["agendado", "concluido"]);
      
      if (checkError) {
        toast({
          title: "Erro ao verificar disponibilidade",
          description: checkError.message,
          variant: "destructive",
        });
        throw checkError;
      }
      
      if (existingAppointments && existingAppointments.length > 0) {
        toast({
          title: "Horário indisponível",
          description: "Este horário já foi reservado. Por favor, escolha outro horário.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      let clientId;
      
      try {
        if (appointmentData.client.id) {
          clientId = appointmentData.client.id;
        } else {
          const { data: existingClientByEmail, error: emailCheckError } = await supabase
            .from("clientes")
            .select("id")
            .eq("email", appointmentData.client.email.trim().toLowerCase())
            .maybeSingle();
          
          if (emailCheckError) throw emailCheckError;
          
          if (existingClientByEmail) {
            clientId = existingClientByEmail.id;
          } else {
            const formattedPhone = appointmentData.client.telefone;
            const { data: existingClientByPhone, error: phoneCheckError } = await supabase
              .from("clientes")
              .select("id")
              .eq("telefone", formattedPhone)
              .maybeSingle();
            
            if (phoneCheckError) throw phoneCheckError;
            
            if (existingClientByPhone) {
              clientId = existingClientByPhone.id;
            } else {
              const { data: newClient, error: createError } = await supabase
                .from("clientes")
                .insert({
                  nome: appointmentData.client.nome,
                  telefone: formattedPhone,
                  email: appointmentData.client.email.trim().toLowerCase(),
                })
                .select("id")
                .single();
              
              if (createError) {
                console.error("Erro ao criar cliente:", createError);
                toast({
                  title: "Erro ao criar cliente",
                  description: "O e-mail ou telefone pode já estar em uso.",
                  variant: "destructive",
                });
                throw new Error("Erro ao criar cliente. O e-mail ou telefone pode já estar em uso.");
              }
              
              clientId = newClient.id;
            }
          }
        }

        const { data: latestCheck, error: latestCheckError } = await supabase
          .from("agendamentos")
          .select("*")
          .eq("data", formattedDate)
          .eq("hora", appointmentData.time)
          .eq("profissional_id", appointmentData.professional_id)
          .in("status", ["agendado", "concluido"]);
        
        if (latestCheckError) throw latestCheckError;
        
        if (latestCheck && latestCheck.length > 0) {
          toast({
            title: "Horário indisponível",
            description: "Este horário foi reservado por outro cliente enquanto você completava o formulário. Por favor, escolha outro horário.",
            variant: "destructive",
          });
          return;
        }
        
        const { data: newAppointment, error: appointmentError } = await supabase
          .from("agendamentos")
          .insert({
            cliente_id: clientId,
            servico_id: appointmentData.service.id,
            profissional_id: appointmentData.professional_id,
            data: formattedDate,
            hora: appointmentData.time,
            status: "agendado",
          })
          .select("id")
          .single();
        
        if (appointmentError) throw appointmentError;
        
        setAppointmentId(newAppointment.id);
        setIsComplete(true);
        
        toast({
          title: "Agendamento confirmado!",
          description: "Seu horário foi reservado com sucesso.",
        });
      } catch (error: any) {
        console.error("Erro ao processar cliente:", error);
        toast({
          title: "Erro ao processar dados do cliente",
          description: error.message || "Ocorreu um erro ao processar seus dados. Tente novamente.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Erro ao criar agendamento:", error);
      toast({
        title: "Erro ao confirmar agendamento",
        description: error.message || "Ocorreu um erro ao processar seu agendamento. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const createWhatsAppMessage = () => {
    if (!appointmentData.client || !appointmentData.service || !appointmentData.date || !appointmentData.time) {
      return "";
    }

    const message = `Olá! Confirmo meu agendamento no Studio Sandy Yasmin para ${appointmentData.service.nome} no dia ${formatDate(appointmentData.date)} às ${appointmentData.time}. Meu nome é ${appointmentData.client.nome}.`;
    
    return message;
  };

  if (!appointmentData.service || !appointmentData.date || !appointmentData.time || !appointmentData.client) {
    return (
      <div className="text-center py-8">
        <p className="text-destructive mb-4">
          Informações incompletas. Por favor, complete todas as etapas anteriores.
        </p>
        <Button onClick={prevStep}>Voltar</Button>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-playfair font-semibold mb-6">
        {isComplete ? "Agendamento Confirmado!" : "Confirmar Agendamento"}
      </h2>
      <Card className="mb-6 bg-secondary/30">
        <CardContent className="pt-6">
          <AppointmentSummary
            service={appointmentData.service}
            professionalName={professional?.nome}
            date={appointmentData.date}
            time={appointmentData.time}
            client={appointmentData.client}
          />
        </CardContent>
      </Card>
      {isComplete ? (
        <ConfirmationSuccess
          clientPhone={appointmentData.client.telefone}
          whatsappMessage={createWhatsAppMessage()}
        />
      ) : (
        <ConfirmationActions
          isSubmitting={isSubmitting}
          onConfirm={handleConfirm}
          onBack={prevStep}
        />
      )}
    </div>
  );
};

export default Confirmation;
