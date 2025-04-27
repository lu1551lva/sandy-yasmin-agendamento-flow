
import { useState, useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

export interface AdminData {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  avatar_url?: string;
  studioName?: string;
  studio_name?: string;
}

export const useAdminProfile = () => {
  const { user } = useAuth();
  const [adminData, setAdminData] = useState<AdminData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchAdminData = async () => {
      if (!user?.email) {
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('admins')
          .select('*')
          .eq('email', user.email)
          .single();
          
        if (error) {
          console.error("Error fetching admin data:", error);
          toast({
            title: "Erro ao carregar perfil",
            description: "Não foi possível carregar os dados do perfil.",
            variant: "destructive",
          });
        } else if (data) {
          console.log("Admin data fetched:", data);
          setAdminData(data);
        }
      } catch (error) {
        console.error("Error in fetchAdminData:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAdminData();
  }, [user, toast]);

  return { adminData, setAdminData, isLoading };
};
