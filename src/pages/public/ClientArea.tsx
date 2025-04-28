
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatDate } from "@/lib/dateUtils";
import { formatCurrency } from "@/lib/supabase";
import { ReviewForm } from "@/components/reviews/ReviewForm";
import { DataTablePagination } from "@/components/common/DataTablePagination";
import { CalendarClock, CheckCircle, Star, User } from "lucide-react";

const ClientArea = () => {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [client, setClient] = useState<any>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [viewingAppointment, setViewingAppointment] = useState<string | null>(null);
  const { toast } = useToast();
  const limit = 5; // Appointments per page

  const verifyClient = async (e: React.FormEvent) => {
    e.preventDefault();
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

  useEffect(() => {
    if (client) {
      loadAppointments(client.id);
    }
  }, [currentPage, client]);

  const handleReviewSuccess = () => {
    if (client) {
      loadAppointments(client.id);
    }
    setViewingAppointment(null);
    toast({
      title: "Avaliação enviada",
      description: "Obrigado pelo seu feedback!"
    });
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
            <form onSubmit={verifyClient} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="phone" className="text-sm font-medium">
                  Telefone
                </label>
                <Input
                  id="phone"
                  placeholder="(99) 99999-9999"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>
              
              <Button type="submit" className="w-full" disabled={isVerifying}>
                {isVerifying ? "Verificando..." : "Acessar"}
              </Button>
              
              <p className="text-xs text-center text-muted-foreground mt-4">
                Insira o email e telefone utilizados no seu agendamento
              </p>
            </form>
          </CardContent>
        </Card>
      ) : (
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
                        onSuccess={handleReviewSuccess} 
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
                          {appointments.map((appointment) => {
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
                                          onClick={() => setViewingAppointment(appointment.id)}
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
                          })}
                          
                          {totalPages > 1 && (
                            <DataTablePagination
                              currentPage={currentPage}
                              totalPages={totalPages}
                              onPageChange={setCurrentPage}
                            />
                          )}
                        </div>
                      )}
                    </>
                  )}
                </TabsContent>
                
                <TabsContent value="profile" className="mt-4 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Nome</label>
                      <p>{client.nome}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Email</label>
                      <p>{client.email}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Telefone</label>
                      <p>{client.telefone}</p>
                    </div>
                  </div>
                  
                  <div className="pt-4">
                    <Button 
                      variant="outline" 
                      onClick={() => setClient(null)}
                    >
                      Sair
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ClientArea;
