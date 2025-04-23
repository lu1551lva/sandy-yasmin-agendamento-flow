
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { Session, User } from '@supabase/supabase-js';
import { useToast } from '@/hooks/use-toast';
import { Salon } from '@/lib/supabase';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  salon: Salon | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, salonData?: Partial<Salon>) => Promise<{ error: Error | null, user: User | null }>;
  signOut: () => Promise<void>;
  isSuperAdmin: boolean;
  refreshSalonData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [salon, setSalon] = useState<Salon | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const { toast } = useToast();

  const fetchSalonData = async (userId: string) => {
    if (!userId) return;

    const { data, error } = await supabase
      .from('saloes')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching salon data:', error);
      return;
    }

    setSalon(data);
    
    // Check if this is the super admin
    setIsSuperAdmin(data?.email === 'admin@meusistema.com');
  };

  const refreshSalonData = async () => {
    if (user?.id) {
      await fetchSalonData(user.id);
    }
  };

  useEffect(() => {
    const setData = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error(error);
      } else {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await fetchSalonData(session.user.id);
        }
      }
      setLoading(false);
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        await fetchSalonData(session.user.id);
      } else {
        setSalon(null);
        setIsSuperAdmin(false);
      }
      
      setLoading(false);
    });

    setData();

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        toast({
          title: "Erro ao fazer login",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }
      
      toast({
        title: "Login realizado com sucesso",
        description: "Bem-vindo ao seu painel administrativo",
      });
      
      return { error: null };
    } catch (error) {
      console.error('Error signing in:', error);
      return { error: error as Error };
    }
  };

  const signUp = async (email: string, password: string, salonData?: Partial<Salon>) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        toast({
          title: "Erro ao criar conta",
          description: error.message,
          variant: "destructive",
        });
        return { error, user: null };
      }

      if (data.user && salonData) {
        // Create salon record tied to this user ID
        const { error: salonError } = await supabase
          .from('saloes')
          .insert({ 
            id: data.user.id,
            nome: salonData.nome || '',
            email: email,
            telefone: salonData.telefone || '',
            url_personalizado: salonData.url_personalizado || '',
            plano: 'trial',
            trial_expira_em: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          });

        if (salonError) {
          toast({
            title: "Erro ao criar salão",
            description: salonError.message,
            variant: "destructive",
          });
          return { error: salonError as Error, user: data.user };
        }
      }

      toast({
        title: "Conta criada com sucesso!",
        description: "Bem-vindo à plataforma",
      });

      return { error: null, user: data.user };
    } catch (error) {
      console.error('Error signing up:', error);
      return { error: error as Error, user: null };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Logout realizado com sucesso",
      });
      setSalon(null);
      setIsSuperAdmin(false);
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        title: "Erro ao fazer logout",
        description: "Tente novamente mais tarde",
        variant: "destructive",
      });
    }
  };

  const value = {
    session,
    user,
    salon,
    loading,
    signIn,
    signUp,
    signOut,
    isSuperAdmin,
    refreshSalonData
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
