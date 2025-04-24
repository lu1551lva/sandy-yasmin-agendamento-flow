
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CardContent } from '@/components/ui/card';
import { useAuth } from '@/context/auth-context';
import { Loader } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const RegisterForm = () => {
  const [salonName, setSalonName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [customUrl, setCustomUrl] = useState('');
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w\s]/g, '')
      .replace(/\s+/g, '-');
  };

  const handleSalonNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setSalonName(name);
    
    if (!customUrl || customUrl === generateSlug(salonName)) {
      setCustomUrl(generateSlug(name));
    }
  };

  const handleCustomUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^\w-]/g, '').toLowerCase();
    setCustomUrl(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const { error } = await signUp(email, password, {
        nome: salonName,
        url_personalizado: customUrl,
        telefone: phone
      });
      
      if (error) {
        toast({
          title: "Registro não disponível",
          description: error,
          variant: "destructive"
        });
        navigate('/admin/login');
      }
    } catch (error) {
      console.error('Erro no registro:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <CardContent>
      <div className="space-y-4 text-center">
        <p>O registro não é permitido para Studio Sandy Yasmin.</p>
        <p>Este é um aplicativo de inquilino único.</p>
        
        <Button
          className="w-full"
          onClick={() => navigate('/admin/login')}
        >
          Ir para página de login
        </Button>
      </div>
    </CardContent>
  );
};
