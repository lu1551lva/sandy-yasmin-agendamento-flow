
import { useState, useEffect } from 'react';
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

  // Check token expiration on mount
  useEffect(() => {
    const checkToken = () => {
      const adminToken = localStorage.getItem('adminToken');
      const adminTokenExpiry = localStorage.getItem('adminTokenExpiry');
      
      if (adminToken && adminTokenExpiry) {
        const isExpired = new Date().getTime() > parseInt(adminTokenExpiry, 10);
        
        if (isExpired) {
          // Token expired, logout user
          localStorage.removeItem('adminLoggedIn');
          localStorage.removeItem('adminToken');
          localStorage.removeItem('adminTokenExpiry');
          setIsLoggedIn(false);
        }
      }
    };
    
    checkToken();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      // Fixed credentials for Studio Sandy Yasmin
      const validEmail = 'admin@studio.com';
      const validPassword = 'admin123';
      
      if (email === validEmail && password === validPassword) {
        // Set admin token with 24 hour expiry
        const token = Math.random().toString(36).substring(2);
        const expiryTime = new Date().getTime() + (24 * 60 * 60 * 1000); // 24 hours
        
        localStorage.setItem('adminLoggedIn', 'true');
        localStorage.setItem('adminToken', token);
        localStorage.setItem('adminTokenExpiry', expiryTime.toString());
        
        setIsLoggedIn(true);
        
        // Redirect to admin dashboard
        navigate('/admin');
        
        toast({
          title: 'Login realizado com sucesso',
          description: 'Bem-vindo ao painel administrativo',
        });
        
        return true;
      } else {
        toast({
          title: 'Erro de Login',
          description: 'E-mail ou senha inválidos',
          variant: 'destructive'
        });
        return false;
      }
    } catch (err) {
      console.error('Erro ao tentar fazer login:', err);
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
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminTokenExpiry');
    setIsLoggedIn(false);
    navigate('/admin/login');
    
    toast({
      title: 'Logout realizado com sucesso',
      description: 'Você saiu do painel administrativo',
    });
  };

  return { isLoggedIn, login, logout };
};
