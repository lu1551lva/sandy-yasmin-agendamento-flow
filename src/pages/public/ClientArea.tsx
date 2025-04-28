
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { VerificationForm } from "@/components/client-area/VerificationForm";
import { ClientAreaContent } from "@/components/client-area/ClientAreaContent";

const ClientArea = () => {
  const [isVerifying, setIsVerifying] = useState(false);
  const [client, setClient] = useState<any>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { toast } = useToast();
  const limit = 5; // Appointments per page

  const verifyClient = async (email: string, phone: string) => {
    setIsVerifying(true);

    try {
      const { data, error } = await supabase
        .from("clientes")
        .select("*")
        .eq("email", email.trim().toLowerCase())
        .eq("telefone", phone.trim())
        .single();

      if (error || !data) {
        toast({
          title: "Cliente não encontrado",
          description: "Verifique seu email e telefone",
          variant: "destructive",
        });
        return;
      }

      setClient(data);
      loadAppointments(data.id);
    } catch (error: any) {
      toast({
        title: "Erro ao verificar",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const loadAppointments = async (clientId: string) => {
    try {
      const startIndex = (currentPage - 1) * limit;
      
      const { data, error, count } = await supabase
        .from("agendamentos")
        .select(`
          *,
          cliente:clientes(*),
          servico:servicos(*),
          profissional:profissionais(*),
          reviews(*)
        `, { count: "exact" })
        .eq("cliente_id", clientId)
        .order("data", { ascending: false })
        .order("hora", { ascending: false })
        .range(startIndex, startIndex + limit - 1);

      if (error) throw error;
      
      setAppointments(data || []);
      
      if (count !== null) {
        setTotalPages(Math.ceil(count / limit));
      }
    } catch (error: any) {
      toast({
        title: "Erro ao carregar agendamentos",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-center font-playfair mb-2">
        Área do Cliente
      </h1>
      <p className="text-center text-muted-foreground mb-8">
        Acesse seu histórico de agendamentos e deixe sua avaliação
      </p>

      {!client ? (
        <Card>
          <CardHeader>
            <CardTitle>Acesso</CardTitle>
          </CardHeader>
          <CardContent>
            <VerificationForm
              onVerify={verifyClient}
              isVerifying={isVerifying}
            />
          </CardContent>
        </Card>
      ) : (
        <ClientAreaContent
          client={client}
          appointments={appointments}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(page) => {
            setCurrentPage(page);
            loadAppointments(client.id);
          }}
          onLogout={() => setClient(null)}
        />
      )}
    </div>
  );
};

export default ClientArea;
