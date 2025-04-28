
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface VerificationFormProps {
  onVerify: (email: string, phone: string) => Promise<void>;
  isVerifying: boolean;
}

export const VerificationForm = ({ onVerify, isVerifying }: VerificationFormProps) => {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onVerify(email, phone);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
  );
};
