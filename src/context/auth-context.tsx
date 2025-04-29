
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";

// Simplified User type for single-tenant admin
interface User {
  email: string;
}

interface AuthContextProps {
  user: User | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => void;
  signUp: (email: string, password: string, userData?: any) => Promise<{ error: string | null, user: User | null }>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Initialize authentication state from localStorage
  useEffect(() => {
    try {
      console.log('Checking for saved user session...');
      const savedUser = localStorage.getItem('user');
      
      if (savedUser) {
        const parsedUser = JSON.parse(savedUser);
        console.log('Found saved user session:', parsedUser.email);
        setUser(parsedUser);
        setIsLoggedIn(true);
      } else {
        console.log('No saved user session found');
        // Redirect to login if current path requires authentication
        const currentPath = window.location.pathname;
        if (currentPath.startsWith('/admin') && currentPath !== '/admin/login') {
          console.log('Protected route accessed without authentication, redirecting to login');
          navigate('/admin/login');
        }
      }
    } catch (error) {
      console.error('Error while checking saved user session:', error);
      // If there's an error parsing the saved user, clear it
      localStorage.removeItem('user');
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  const signIn = async (email: string, password: string) => {
    try {
      console.log('Attempting to sign in with email:', email);
      setIsLoading(true);
      
      // Fixed credentials for Studio Sandy Yasmin
      if (email === 'admin@studio.com' && password === 'admin123') {
        const userData: User = { email };
        
        setUser(userData);
        setIsLoggedIn(true);
        localStorage.setItem('user', JSON.stringify(userData));
        
        console.log('Login successful:', email);
        navigate('/admin');
        
        return { error: null };
      }
      
      console.error('Login failed: Invalid credentials');
      toast({
        title: "Falha no login",
        description: "Credenciais inválidas. Por favor, tente novamente.",
        variant: "destructive",
      });
      
      return { error: 'Credenciais inválidas' };
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Erro no sistema",
        description: "Ocorreu um erro ao processar seu login. Tente novamente.",
        variant: "destructive",
      });
      return { error: 'Erro no sistema' };
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = () => {
    console.log('Signing out user');
    setUser(null);
    setIsLoggedIn(false);
    localStorage.removeItem('user');
    navigate('/admin/login');
  };

  // Added signUp function to satisfy the Register.tsx requirements
  // For a single-tenant app, this function will always return an error
  const signUp = async (email: string, password: string, userData?: any) => {
    console.log('Sign up attempted, but not allowed in this single-tenant app');
    toast({
      title: "Registro não permitido",
      description: "Este é um aplicativo exclusivo para o Studio Sandy Yasmin.",
      variant: "destructive",
    });
    
    return { 
      error: "Registro não permitido. Este é um aplicativo exclusivo para o Studio Sandy Yasmin.", 
      user: null 
    };
  };

  const value: AuthContextProps = {
    user,
    isLoggedIn,
    isLoading,
    signIn,
    signOut,
    signUp,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
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
