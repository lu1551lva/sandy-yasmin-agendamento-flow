
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase, Service, AppointmentWithDetails } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Check, Loader, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatDate, formatCurrency, createWhatsAppLink } from "@/lib/utils";
import { format } from "date-fns";

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

  // Fetch professional data
  const { data: professional } = useQuery({
    queryKey: ["professional", appointmentData.professional_id],
    queryFn: async () => {
      if (!appointmentData.professional_id) return null;
      
      const { data, error } = await supabase
        .from("profissionais")
        .select("*")
        .eq("id", appointmentData.professional_id)
        .single();
      
      if (error) throw error;
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
      // Format date for database
      const formattedDate = format(appointmentData.date, "yyyy-MM-dd");

      // Check if this time slot is still available
      const { data: existingAppointments, error: checkError } = await supabase
        .from("agendamentos")
        .select("*")
        .eq("data", formattedDate)
        .eq("hora", appointmentData.time)
        .eq("profissional_id", appointmentData.professional_id)
        .neq("status", "cancelado");
      
      if (checkError) throw checkError;
      
      if (existingAppointments && existingAppointments.length > 0) {
        throw new Error("Este horário já foi reservado. Por favor, escolha outro horário.");
      }

      // Determine if we need to create a new client or use an existing one
      let clientId;
      
      if (appointmentData.client.id) {
        // Client already exists
        clientId = appointmentData.client.id;
      } else {
        // Check if client exists by email
        const { data: existingByEmail, error: emailError } = await supabase
          .from("clientes")
          .select("id")
          .eq("email", appointmentData.client.email.toLowerCase())
          .maybeSingle();
        
        if (emailError) throw emailError;
        
        if (existingByEmail) {
          clientId = existingByEmail.id;
        } else {
          // Check if client exists by phone
          const { data: existingByPhone, error: phoneError } = await supabase
            .from("clientes")
            .select("id")
            .eq("telefone", appointmentData.client.telefone)
            .maybeSingle();
          
          if (phoneError) throw phoneError;
          
          if (existingByPhone) {
            clientId = existingByPhone.id;
          } else {
            // Insert new client
            const { data: newClient, error: clientError } = await supabase
              .from("clientes")
              .insert({
                nome: appointmentData.client.nome,
                telefone: appointmentData.client.telefone,
                email: appointmentData.client.email.toLowerCase(),
              })
              .select("id")
              .single();
            
            if (clientError) throw clientError;
            clientId = newClient.id;
          }
        }
      }

      // Create the appointment
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
          <h3 className="font-medium text-lg mb-4">Resumo do agendamento</h3>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Serviço:</span>
              <span className="font-medium">{appointmentData.service.nome}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Valor:</span>
              <span className="font-medium">{formatCurrency(appointmentData.service.valor)}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Data:</span>
              <span className="font-medium">{formatDate(appointmentData.date)}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Horário:</span>
              <span className="font-medium">{appointmentData.time}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Duração:</span>
              <span className="font-medium">{appointmentData.service.duracao_em_minutos} minutos</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Profissional:</span>
              <span className="font-medium">{professional?.nome || "Profissional padrão"}</span>
            </div>
          </div>

          <hr className="my-4" />

          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Nome:</span>
              <span className="font-medium">{appointmentData.client.nome}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Telefone:</span>
              <span className="font-medium">{appointmentData.client.telefone}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">E-mail:</span>
              <span className="font-medium">{appointmentData.client.email}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {isComplete ? (
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-600 mb-2">
            <Check className="h-8 w-8" />
          </div>
          <p className="text-lg">Seu agendamento foi confirmado com sucesso!</p>
          <p className="text-gray-500">
            Enviamos um e-mail com os detalhes do seu agendamento.
          </p>
          
          <div className="mt-6">
            <Button 
              className="w-full sm:w-auto" 
              onClick={() => {
                window.open(
                  createWhatsAppLink(appointmentData.client.telefone, createWhatsAppMessage()),
                  "_blank"
                );
              }}
            >
              <Send className="mr-2 h-4 w-4" /> Enviar confirmação via WhatsApp
            </Button>
          </div>
          
          <div className="mt-4">
            <Button
              variant="outline"
              className="w-full sm:w-auto"
              onClick={() => window.location.href = "/agendar"}
            >
              Fazer novo agendamento
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex justify-between">
          <Button variant="outline" onClick={prevStep} disabled={isSubmitting}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
          </Button>
          <Button onClick={handleConfirm} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader className="mr-2 h-4 w-4 animate-spin" /> Processando...
              </>
            ) : (
              "Confirmar agendamento"
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

export default Confirmation;
