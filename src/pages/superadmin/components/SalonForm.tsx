
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader } from "lucide-react";

const salonSchema = z.object({
  nome: z.string().min(3, "Nome é obrigatório e precisa ter pelo menos 3 caracteres"),
  nome_profissional: z.string().min(2, "Nome do profissional é obrigatório"),
  email: z.string().email("E-mail inválido"),
  senha: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
  url_personalizado: z
    .string()
    .min(3, "URL personalizada deve ter pelo menos 3 caracteres")
    .regex(/^[a-z0-9-]+$/, "URL deve conter apenas letras minúsculas, números e hífens")
    .transform((val) => val.toLowerCase()),
  telefone: z.string().optional(),
  plano: z.enum(["trial", "ativo", "inativo"]).default("trial"),
});

type SalonFormValues = z.infer<typeof salonSchema>;

interface SalonFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function SalonForm({ onSuccess, onCancel }: SalonFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<SalonFormValues>({
    resolver: zodResolver(salonSchema),
    defaultValues: {
      nome: "",
      nome_profissional: "",
      email: "",
      senha: "",
      url_personalizado: "",
      telefone: "",
      plano: "trial",
    },
  });

  async function onSubmit(data: SalonFormValues) {
    setIsSubmitting(true);

    try {
      // Check if slug is already in use
      const { data: slugCheck, error: slugError } = await supabase
        .from("saloes")
        .select("id")
        .eq("url_personalizado", data.url_personalizado)
        .single();

      if (slugCheck) {
        form.setError("url_personalizado", {
          type: "manual",
          message: "Esta URL personalizada já está em uso",
        });
        setIsSubmitting(false);
        return;
      }

      // Check if email is already in use
      const { data: emailCheck, error: emailError } = await supabase
        .from("saloes")
        .select("id")
        .eq("email", data.email)
        .single();

      if (emailCheck) {
        form.setError("email", {
          type: "manual",
          message: "Este e-mail já está em uso",
        });
        setIsSubmitting(false);
        return;
      }

      // Create user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.senha,
      });

      if (authError || !authData.user) {
        toast({
          title: "Erro ao criar conta",
          description: authError?.message || "Ocorreu um erro ao criar a conta",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      // Set trial expiration date
      const trialExpiresAt = new Date();
      trialExpiresAt.setDate(trialExpiresAt.getDate() + 30);

      // Create salon record
      const { data: salon, error: salonError } = await supabase
        .from("saloes")
        .insert({
          id: authData.user.id,
          nome: data.nome,
          email: data.email,
          telefone: data.telefone || null,
          url_personalizado: data.url_personalizado,
          plano: data.plano,
          trial_expira_em: data.plano === "trial" ? trialExpiresAt.toISOString().split("T")[0] : null,
        })
        .select()
        .single();

      if (salonError) {
        toast({
          title: "Erro ao criar salão",
          description: salonError.message,
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      // Create initial professional
      const { error: profError } = await supabase.from("profissionais").insert({
        nome: data.nome_profissional,
        dias_atendimento: ["segunda", "terca", "quarta", "quinta", "sexta"],
        horario_inicio: "09:00",
        horario_fim: "18:00",
        salao_id: authData.user.id,
      });

      if (profError) {
        console.error("Erro ao criar profissional:", profError);
      }

      toast({
        title: "Sucesso!",
        description: `Salão ${data.nome} criado com sucesso!`,
      });

      form.reset();
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Erro ao criar salão:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao criar o salão",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cadastrar Novo Salão</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="nome"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Salão</FormLabel>
                    <FormControl>
                      <Input placeholder="Studio Beauty" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="nome_profissional"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Profissional Principal</FormLabel>
                    <FormControl>
                      <Input placeholder="Maria Silva" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-mail (login)</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="contato@salao.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="senha"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Senha</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Senha de acesso" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="url_personalizado"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL Personalizada</FormLabel>
                    <FormControl>
                      <div className="flex items-center">
                        <span className="text-sm text-gray-500 mr-1">/</span>
                        <Input placeholder="studio-beauty" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="telefone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone (opcional)</FormLabel>
                    <FormControl>
                      <Input placeholder="(11) 99999-9999" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="plano"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="trial">Trial (30 dias)</SelectItem>
                      <SelectItem value="ativo">Ativo</SelectItem>
                      <SelectItem value="inativo">Inativo</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2 pt-4">
              {onCancel && (
                <Button type="button" variant="outline" onClick={onCancel}>
                  Cancelar
                </Button>
              )}
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader className="mr-2 h-4 w-4 animate-spin" /> Criando...
                  </>
                ) : (
                  "Criar Salão"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
