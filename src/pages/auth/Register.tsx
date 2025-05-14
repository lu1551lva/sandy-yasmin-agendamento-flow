
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { RegisterHeader } from '@/components/auth/RegisterHeader';
import { ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Register = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  useEffect(() => {
    toast({
      title: "Registro não disponível",
      description: "Este é um aplicativo exclusivo para Connect Studio Pro. Por favor faça login com as credenciais fornecidas.",
      variant: "destructive"
    });
    navigate('/admin/login');
  }, [navigate, toast]);

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
        <RegisterHeader />
        <RegisterForm />
      </Card>
    </div>
  );
};

export default Register;
