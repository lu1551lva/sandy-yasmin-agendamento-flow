
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useFormValidation } from "@/hooks/useFormValidation";
import { formatPhoneNumber } from "@/lib/phoneUtils";

interface ClientData {
  nome: string;
  telefone: string;
  email: string;
}

interface ClientFormProps {
  onSubmit: (data: ClientData) => void;
  defaultValues?: Partial<ClientData>;
}

export function ClientForm({ onSubmit, defaultValues = {} }: ClientFormProps) {
  const {
    values,
    errors,
    handleChange,
    handleBlur,
    validateForm,
    setValues
  } = useFormValidation({
    initialValues: {
      nome: defaultValues.nome || "",
      telefone: defaultValues.telefone || "",
      email: defaultValues.email || "",
    }
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle phone number formatting
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatPhoneNumber(e.target.value);
    setValues({ ...values, telefone: formattedValue });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsSubmitting(true);
      
      onSubmit({
        nome: values.nome,
        telefone: values.telefone,
        email: values.email
      });
      
      setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="nome">Nome</Label>
        <Input
          id="nome"
          name="nome"
          value={values.nome}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="Nome completo"
          required
        />
        {errors.nome && <p className="text-sm text-destructive">{errors.nome}</p>}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="telefone">Telefone</Label>
        <Input
          id="telefone"
          name="telefone"
          value={values.telefone}
          onChange={handlePhoneChange}
          onBlur={handleBlur}
          placeholder="(00) 00000-0000"
          required
        />
        {errors.telefone && <p className="text-sm text-destructive">{errors.telefone}</p>}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          value={values.email}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="email@exemplo.com"
          required
        />
        {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
      </div>
      
      <div className="flex justify-end gap-2 pt-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Salvando..." : defaultValues.nome ? "Atualizar" : "Adicionar"}
        </Button>
      </div>
    </form>
  );
}
