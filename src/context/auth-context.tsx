
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from "@/lib/supabase";

interface AuthContextProps {
  user: any;
  isLoggedIn: boolean;
  isLoading: boolean;
  signUp: (email: string, password: string, additionalData: any) => Promise<any>;
  signIn: (email: string, password: string) => Promise<any>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function getSession() {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        setUser(data?.session?.user ?? null);
        setIsLoggedIn(!!data?.session?.user);
        setIsLoading(false);
      } catch (error) {
        console.error("Error getting session:", error);
        setIsLoading(false);
      }
    }
    
    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        setIsLoggedIn(true);
      } else {
        setUser(null);
        setIsLoggedIn(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, additionalData: any) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: additionalData,
        }
      });

      if (error) {
        console.error("Erro ao registrar:", error);
        throw error;
      }

      if (data.user) {
        setUser(data.user);
        setIsLoggedIn(true);
        
        // Update user metadata
        const { error: metadataError } = await supabase
          .from('admins')
          .insert([
            { 
              id: data.user.id, 
              email: email, 
              senha: password 
            }
          ]);
          
        if (metadataError) {
          console.error("Erro ao inserir metadados do usuário:", metadataError);
          throw metadataError;
        }
      }
      
      return { data, error };
    } catch (error: any) {
      console.error("Erro no signUp:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) {
        console.error("Erro ao logar:", error);
        throw error;
      }

      if (data.user) {
        setUser(data.user);
        setIsLoggedIn(true);
      }
      
      return { data, error };
    } catch (error: any) {
      console.error("Erro no signIn:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error("Erro ao deslogar:", error);
        throw error;
      }

      setUser(null);
      setIsLoggedIn(false);
      navigate('/admin/login');
    } catch (error: any) {
      console.error("Erro no signOut:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const value: AuthContextProps = {
    user,
    isLoggedIn,
    isLoading,
    signUp,
    signIn,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
