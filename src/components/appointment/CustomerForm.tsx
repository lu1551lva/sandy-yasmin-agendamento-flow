
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase, Client } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";
import { validateEmail, validatePhone, formatPhoneNumber } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface CustomerFormProps {
  client: Client | null;
  updateAppointmentData: (data: { client: Client | null }) => void;
  nextStep: () => void;
  prevStep: () => void;
}

const CustomerForm = ({
  client,
  updateAppointmentData,
  nextStep,
  prevStep,
}: CustomerFormProps) => {
  const [name, setName] = useState(client?.nome || "");
  const [phone, setPhone] = useState(client?.telefone || "");
  const [email, setEmail] = useState(client?.email || "");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isCheckingClient, setIsCheckingClient] = useState(false);
  const { toast } = useToast();

  // Check if client already exists by email
  const { data: existingClients, refetch: checkExistingClient } = useQuery({
    queryKey: ["clients", email],
    queryFn: async () => {
      if (!email) return [];
      
      const { data, error } = await supabase
        .from("clientes")
        .select("*")
        .eq("email", email);
      
      if (error) throw error;
      return data as Client[];
    },
    enabled: false, // Don't run on mount, only when explicitly called
  });

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!name.trim()) {
      newErrors.name = "O nome é obrigatório";
    }
    
    if (!phone.trim()) {
      newErrors.phone = "O telefone é obrigatório";
    } else if (!validatePhone(phone)) {
      newErrors.phone = "Formato de telefone inválido. Use (DDD) XXXXX-XXXX";
    }
    
    if (!email.trim()) {
      newErrors.email = "O e-mail é obrigatório";
    } else if (!validateEmail(email)) {
      newErrors.email = "Formato de e-mail inválido";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = async () => {
    if (!validateForm()) return;
    
    setIsCheckingClient(true);
    
    try {
      // Check if client already exists
      await checkExistingClient();
      
      if (existingClients && existingClients.length > 0) {
        // Use existing client data
        const existingClient = existingClients[0];
        updateAppointmentData({ client: existingClient });
        toast({
          title: "Cliente encontrado",
          description: "Utilizaremos seus dados já cadastrados.",
          duration: 3000,
        });
      } else {
        // Create new client data object
        const newClient: Omit<Client, "id" | "created_at"> = {
          nome: name.trim(),
          telefone: formatPhoneNumber(phone),
          email: email.trim().toLowerCase(),
        };
        
        updateAppointmentData({ client: newClient as Client });
      }
      
      nextStep();
    } catch (error) {
      console.error("Error checking client:", error);
      toast({
        title: "Erro ao verificar dados",
        description: "Ocorreu um erro ao verificar seus dados. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsCheckingClient(false);
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPhone(formatPhoneNumber(value));
  };

  return (
    <div>
      <h2 className="text-2xl font-playfair font-semibold mb-6">
        Seus dados
      </h2>

      <div className="space-y-4">
        <div>
          <Label htmlFor="name">Nome completo</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Digite seu nome completo"
            className={errors.name ? "border-red-500" : ""}
          />
          {errors.name && (
            <p className="text-red-500 text-sm mt-1">{errors.name}</p>
          )}
        </div>

        <div>
          <Label htmlFor="phone">Telefone com DDD</Label>
          <Input
            id="phone"
            value={phone}
            onChange={handlePhoneChange}
            placeholder="(00) 00000-0000"
            className={errors.phone ? "border-red-500" : ""}
          />
          {errors.phone && (
            <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
          )}
        </div>

        <div>
          <Label htmlFor="email">E-mail</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu@email.com"
            className={errors.email ? "border-red-500" : ""}
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email}</p>
          )}
        </div>
      </div>

      <div className="mt-8 flex justify-between">
        <Button variant="outline" onClick={prevStep}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
        </Button>
        <Button onClick={handleContinue} disabled={isCheckingClient}>
          {isCheckingClient ? "Verificando..." : "Continuar"}
        </Button>
      </div>
    </div>
  );
};

export default CustomerForm;
