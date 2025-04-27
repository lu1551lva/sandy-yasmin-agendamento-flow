
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const personalInfoSchema = z.object({
  nome: z.string().min(2, "O nome deve ter pelo menos 2 caracteres"),
  studioName: z.string().min(2, "O nome do studio deve ter pelo menos 2 caracteres"),
  email: z.string().email("Email inválido").optional(),
  telefone: z.string()
    .regex(
      /^\+55 \(\d{2}\) \d{5}-\d{4}$/,
      "Formato inválido. Use: +55 (XX) XXXXX-XXXX"
    ),
});

type PersonalInfoFormValues = z.infer<typeof personalInfoSchema>;

interface PersonalInfoFormProps {
  defaultValues: PersonalInfoFormValues;
  onSubmit: (data: PersonalInfoFormValues) => Promise<boolean | void>;
  isSubmitting?: boolean;
}

export const PersonalInfoForm = ({ defaultValues, onSubmit, isSubmitting = false }: PersonalInfoFormProps) => {
  const form = useForm<PersonalInfoFormValues>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Informações Pessoais</CardTitle>
        <CardDescription>
          Atualize suas informações pessoais e de contato
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="nome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="studioName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Studio</FormLabel>
                  <FormControl>
                    <Input {...field} />
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
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input {...field} readOnly disabled className="bg-muted" />
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
                  <FormLabel>Telefone</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      placeholder="+55 (XX) XXXXX-XXXX"
                      onChange={(e) => {
                        const cleaned = e.target.value.replace(/\D/g, '');
                        if (cleaned.length <= 13) {
                          let formatted = cleaned;
                          if (cleaned.length >= 2) formatted = `+${cleaned.slice(0,2)} `;
                          if (cleaned.length >= 4) formatted += `(${cleaned.slice(2,4)}) `;
                          if (cleaned.length >= 9) formatted += `${cleaned.slice(4,9)}-`;
                          if (cleaned.length >= 13) formatted += cleaned.slice(9,13);
                          field.onChange(formatted);
                        }
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button 
              type="submit" 
              disabled={isSubmitting} 
              className="w-full"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                "Salvar alterações"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
