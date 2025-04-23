
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Salon } from "@/lib/supabase";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader, Search, Check, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const SaloesList = () => {
  const [salons, setSalons] = useState<Salon[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const { toast } = useToast();

  const fetchSalons = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("saloes")
      .select("*")
      .order("nome");

    if (error) {
      console.error("Error fetching salons:", error);
      toast({
        title: "Erro ao carregar salões",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setSalons(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSalons();
  }, []);

  const updateSalonStatus = async (salonId: string, plano: "trial" | "ativo" | "inativo") => {
    const { error } = await supabase
      .from("saloes")
      .update({ plano })
      .eq("id", salonId);

    if (error) {
      console.error("Error updating salon status:", error);
      toast({
        title: "Erro ao atualizar status",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Status atualizado",
        description: "O status do salão foi atualizado com sucesso.",
      });
      fetchSalons();
    }
  };

  const resetTrial = async (salonId: string) => {
    const trialDate = new Date();
    trialDate.setDate(trialDate.getDate() + 7);
    
    const { error } = await supabase
      .from("saloes")
      .update({ 
        plano: "trial",
        trial_expira_em: trialDate.toISOString().split("T")[0]
      })
      .eq("id", salonId);

    if (error) {
      console.error("Error resetting trial:", error);
      toast({
        title: "Erro ao reiniciar trial",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Trial reiniciado",
        description: "O período de trial foi reiniciado para 7 dias.",
      });
      fetchSalons();
    }
  };

  const filteredSalons = salons.filter(salon => 
    salon.nome.toLowerCase().includes(search.toLowerCase()) ||
    salon.email.toLowerCase().includes(search.toLowerCase()) ||
    salon.url_personalizado.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Gerenciar Salões</h1>
        <div className="relative w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar salões..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <Card>
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>URL</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Trial Expira</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSalons.length > 0 ? (
                  filteredSalons.map((salon) => (
                    <TableRow key={salon.id}>
                      <TableCell className="font-medium">{salon.nome}</TableCell>
                      <TableCell>{salon.email}</TableCell>
                      <TableCell>
                        <a 
                          href={`/agendar/${salon.url_personalizado}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:underline"
                        >
                          {salon.url_personalizado}
                        </a>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={salon.plano} />
                      </TableCell>
                      <TableCell>
                        {salon.plano === "trial" && salon.trial_expira_em
                          ? new Date(salon.trial_expira_em).toLocaleDateString("pt-BR")
                          : "-"}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          {salon.plano !== "ativo" && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 text-xs"
                              onClick={() => updateSalonStatus(salon.id, "ativo")}
                            >
                              <Check className="h-3 w-3 mr-1" /> Ativar
                            </Button>
                          )}
                          {salon.plano !== "trial" && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 text-xs"
                              onClick={() => resetTrial(salon.id)}
                            >
                              Reiniciar Trial
                            </Button>
                          )}
                          {salon.plano !== "inativo" && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 text-xs text-red-500 border-red-500 hover:bg-red-50"
                              onClick={() => updateSalonStatus(salon.id, "inativo")}
                            >
                              <X className="h-3 w-3 mr-1" /> Inativar
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      {search ? (
                        <>Nenhum salão encontrado para "{search}".</>
                      ) : (
                        <>Nenhum salão cadastrado.</>
                      )}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>
    </div>
  );
};

const StatusBadge = ({ status }: { status: string }) => {
  switch (status) {
    case "ativo":
      return <Badge className="bg-green-500">Ativo</Badge>;
    case "trial":
      return <Badge variant="outline" className="border-amber-500 text-amber-500">Trial</Badge>;
    case "inativo":
      return <Badge variant="destructive">Inativo</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};

export default SaloesList;
