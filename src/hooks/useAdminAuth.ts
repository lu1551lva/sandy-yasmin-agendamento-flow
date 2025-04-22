
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface AdminAuthState {
  isLoggedIn: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

export const useAdminAuth = (): AdminAuthState => {
  const [isLoggedIn, setIsLoggedIn] = useState(
    localStorage.getItem('adminLoggedIn') === 'true'
  );
  const navigate = useNavigate();
  const { toast } = useToast();

  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase
        .from('admins')
        .select('*')
        .eq('email', email)
        .eq('senha', password)
        .single();

      if (error || !data) {
        toast({
          title: 'Erro de Login',
          description: 'E-mail ou senha inválidos',
          variant: 'destructive'
        });
        return false;
      }

      localStorage.setItem('adminLoggedIn', 'true');
      setIsLoggedIn(true);
      navigate('/admin');
      return true;
    } catch (err) {
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro ao tentar fazer login',
        variant: 'destructive'
      });
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('adminLoggedIn');
    setIsLoggedIn(false);
    navigate('/agendar');
  };

  return { isLoggedIn, login, logout };
};
