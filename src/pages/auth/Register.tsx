import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/auth-context';
import { Logo } from '@/components/common/Logo';
import { ArrowLeft, Loader } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Register = () => {
  const [salonName, setSalonName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [customUrl, setCustomUrl] = useState('');
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  useEffect(() => {
    toast({
      title: "Registro não disponível",
      description: "Este é um aplicativo de inquilino único para Studio Sandy Yasmin. Por favor faça login com as credenciais fornecidas.",
      variant: "destructive"
    });
    navigate('/admin/login');
  }, [navigate, toast]);
  
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
      const { error, user } = await signUp(email, password, {
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
    <div className="min-h-screen flex flex-col items-center justify-center bg-secondary/30 px-4">
      <Button 
        variant="ghost" 
        className="absolute top-4 left-4" 
        onClick={() => navigate('/')}
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para a página inicial
      </Button>
      
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <Logo />
          </div>
          <CardTitle className="text-2xl font-playfair">Crie sua conta</CardTitle>
          <CardDescription>
            Esta funcionalidade não está disponível
          </CardDescription>
        </CardHeader>
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
      </Card>
    </div>
  );
};

export default Register;
