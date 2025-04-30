
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DialogFooter } from "@/components/ui/dialog";
import { DialogClose } from "@radix-ui/react-dialog";
import { Service } from "@/lib/supabase";
import { Textarea } from "@/components/ui/textarea";
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
  descricao: z.string().optional(),
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
  categoria_id: z.string().optional(),
  imagem_url: z.string().optional()
});

type FormSchemaType = z.infer<typeof serviceSchema>;

interface ServiceFormProps {
  isEditing: boolean;
  currentService: Service | null;
  onSubmit: (data: FormSchemaType) => void;
  resetForm: () => void;
  categories: { id: string; nome: string }[];
  isSubmitting?: boolean;
}

const ServiceForm: React.FC<ServiceFormProps> = ({ 
  isEditing, 
  currentService, 
  onSubmit, 
  resetForm,
  categories,
  isSubmitting = false
}) => {
  const form = useForm<FormSchemaType>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      nome: "",
      descricao: "",
      valor: "",
      duracao_em_minutos: "",
      categoria_id: "",
      imagem_url: ""
    }
  });
  
  useEffect(() => {
    if (isEditing && currentService) {
      form.reset({
        nome: currentService.nome,
        descricao: currentService.descricao || "",
        valor: String(currentService.valor),
        duracao_em_minutos: String(currentService.duracao_em_minutos),
        categoria_id: currentService.categoria_id || "",
        imagem_url: currentService.imagem_url || ""
      });
    } else {
      form.reset({
        nome: "",
        descricao: "",
        valor: "",
        duracao_em_minutos: "",
        categoria_id: "",
        imagem_url: ""
      });
    }
  }, [isEditing, currentService, form]);

  const handleSubmit = (data: FormSchemaType) => {
    console.log("Submitting service form data:", data);
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
              <FormLabel>Nome do Serviço</FormLabel>
              <FormControl>
                <Input
                  placeholder="Ex: Design de Sobrancelha"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="descricao"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Descreva o serviço..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="categoria_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Categoria</FormLabel>
              <FormControl>
                <select
                  className="w-full p-2 border rounded-md"
                  {...field}
                >
                  <option value="">Selecione uma categoria</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.nome}
                    </option>
                  ))}
                </select>
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
              <FormLabel>Valor (R$)</FormLabel>
              <FormControl>
                <Input
                  placeholder="Ex: 40.00"
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
              <FormLabel>Duração (minutos)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="Ex: 30"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="imagem_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL da Imagem</FormLabel>
              <FormControl>
                <Input
                  placeholder="URL da imagem do serviço"
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
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <span className="animate-spin mr-2">⏳</span>
                {isEditing ? "Atualizando..." : "Cadastrando..."}
              </>
            ) : (
              isEditing ? "Atualizar" : "Cadastrar"
            )}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
};

export default ServiceForm;
