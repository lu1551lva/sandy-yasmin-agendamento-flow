
import { useState } from 'react';
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
  
  // Helper function to create URL friendly slugs
  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w\s]/g, '')
      .replace(/\s+/g, '-');
  };

  // Update custom URL when salon name changes
  const handleSalonNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setSalonName(name);
    
    // Only auto-generate URL if user hasn't manually edited it yet
    if (!customUrl || customUrl === generateSlug(salonName)) {
      setCustomUrl(generateSlug(name));
    }
  };

  const handleCustomUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Remove spaces and special characters, only allow letters, numbers, and hyphens
    const value = e.target.value.replace(/[^\w-]/g, '').toLowerCase();
    setCustomUrl(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Validation
    if (password !== passwordConfirm) {
      toast({
        title: "Senhas não conferem",
        description: "Por favor verifique se as senhas são iguais",
        variant: "destructive"
      });
      setIsLoading(false);
      return;
    }
    
    if (password.length < 6) {
      toast({
        title: "Senha muito curta",
        description: "A senha deve ter pelo menos 6 caracteres",
        variant: "destructive"
      });
      setIsLoading(false);
      return;
    }
    
    if (!salonName || !email || !customUrl) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      setIsLoading(false);
      return;
    }
    
    try {
      const { error, user } = await signUp(email, password, {
        nome: salonName,
        url_personalizado: customUrl,
        telefone: phone
      });
      
      if (!error && user) {
        // Redirect to admin dashboard with the custom URL
        navigate(`/admin/${customUrl}`);
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
            Comece sua avaliação gratuita de 7 dias
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="salonName">Nome do salão/profissional*</Label>
              <Input
                id="salonName"
                placeholder="Studio de Beleza"
                value={salonName}
                onChange={handleSalonNameChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="customUrl">URL personalizada*</Label>
              <div className="flex items-center">
                <span className="text-sm text-muted-foreground mr-1 whitespace-nowrap">/agendar/</span>
                <Input
                  id="customUrl"
                  placeholder="seu-salao"
                  value={customUrl}
                  onChange={handleCustomUrlChange}
                  required
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Este será o link que seus clientes usarão para agendar: /agendar/{customUrl}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">E-mail*</Label>
              <Input
                id="email"
                type="email"
                placeholder="contato@seusalao.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                placeholder="(00) 00000-0000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Senha*</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="passwordConfirm">Confirme a senha*</Label>
              <Input
                id="passwordConfirm"
                type="password"
                placeholder="••••••••"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                autoComplete="new-password"
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" /> Criando conta...
                </>
              ) : (
                "Criar conta"
              )}
            </Button>
            
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Já possui uma conta?{' '}
                <Button variant="link" className="p-0 h-auto" onClick={() => navigate('/admin/login')}>
                  Entrar
                </Button>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Register;
