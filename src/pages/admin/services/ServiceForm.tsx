
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DialogFooter } from "@/components/ui/dialog";
import { DialogClose } from "@radix-ui/react-dialog";
import { Service } from "@/lib/supabase";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

// Schema for service validation
const serviceSchema = z.object({
  nome: z.string().min(3, "O nome do serviço deve ter pelo menos 3 caracteres"),
  valor: z.string()
    .refine(val => !isNaN(Number(val.replace(",", "."))), { 
      message: "O valor deve ser um número válido" 
    })
    .refine(val => Number(val.replace(",", ".")) > 0, { 
      message: "O valor deve ser maior que zero" 
    }),
  duracao_em_minutos: z.string()
    .refine(val => !isNaN(Number(val)), { message: "A duração deve ser um número válido" })
    .refine(val => Number(val) > 0, { message: "A duração deve ser maior que zero" }),
});

type FormSchemaType = z.infer<typeof serviceSchema>;

interface ServiceFormProps {
  isEditing: boolean;
  currentService: Service | null;
  onSubmit: (data: FormSchemaType) => void;
  resetForm: () => void;
}

const ServiceForm: React.FC<ServiceFormProps> = ({ 
  isEditing, 
  currentService, 
  onSubmit, 
  resetForm 
}) => {
  // Initialize form with react-hook-form and zod validation
  const form = useForm<FormSchemaType>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      nome: "",
      valor: "",
      duracao_em_minutos: "",
    }
  });
  
  // Update form values when editing a service
  useEffect(() => {
    if (isEditing && currentService) {
      form.reset({
        nome: currentService.nome,
        valor: String(currentService.valor),
        duracao_em_minutos: String(currentService.duracao_em_minutos),
      });
    } else {
      form.reset({
        nome: "",
        valor: "",
        duracao_em_minutos: "",
      });
    }
  }, [isEditing, currentService, form]);

  const handleSubmit = (data: FormSchemaType) => {
    onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="nome"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="nome">Nome do Serviço</FormLabel>
              <FormControl>
                <Input
                  id="nome"
                  placeholder="Ex: Design de Sobrancelha"
                  aria-label="Nome do Serviço"
                  aria-describedby="nome-descricao"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="valor"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="valor">Valor (R$)</FormLabel>
              <FormControl>
                <Input
                  id="valor"
                  placeholder="Ex: 40.00"
                  aria-label="Valor do Serviço"
                  aria-describedby="valor-descricao"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="duracao_em_minutos"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="duracao">Duração (minutos)</FormLabel>
              <FormControl>
                <Input
                  id="duracao"
                  placeholder="Ex: 30"
                  type="number"
                  aria-label="Duração em Minutos"
                  aria-describedby="duracao-descricao"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline" onClick={resetForm}>
              Cancelar
            </Button>
          </DialogClose>
          <Button type="submit">
            {isEditing ? "Atualizar" : "Cadastrar"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
};

export default ServiceForm;
