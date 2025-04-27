
import { useAuth } from "@/context/auth-context";
import { supabase } from "@/lib/supabase";
import { useState, useEffect } from "react";
import { ProfileAvatar } from "@/components/admin/ProfileAvatar";
import { PersonalInfoForm } from "@/components/admin/PersonalInfoForm";
import { PasswordChangeForm } from "@/components/admin/PasswordChangeForm";
import { useToast } from "@/hooks/use-toast";

// Define an interface for admin data
interface AdminData {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  avatar_url?: string;
  studioName?: string;
}

const Profile = () => {
  const { user, signIn } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [adminData, setAdminData] = useState<AdminData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Fetch admin data from database
  useEffect(() => {
    const fetchAdminData = async () => {
      if (!user?.email) {
        setIsLoading(false);
        return;
      }

      try {
        // Get admin data based on email
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

  const onProfileSubmit = async (data: {
    nome: string;
    studioName: string;
    email?: string;
    telefone: string;
    avatar_url?: string;
  }) => {
    setIsSubmitting(true);
    
    try {
      // Check if adminData exists before updating
      if (!adminData?.id) {
        throw new Error("Dados do administrador não encontrados");
      }

      console.log("Updating admin data with:", {
        nome: data.nome,
        telefone: data.telefone,
        studio_name: data.studioName,
        avatar_url: data.avatar_url
      });
      
      // Update the admin profile in the database
      // Map studioName to studio_name field in the database
      const { data: updatedData, error } = await supabase
        .from('admins')
        .update({
          nome: data.nome,
          telefone: data.telefone,
          studio_name: data.studioName,
          avatar_url: data.avatar_url
        })
        .eq('id', adminData.id)
        .select();
        
      if (error) {
        console.error("Supabase update error:", error);
        throw error;
      }
      
      console.log("Update successful, returned data:", updatedData);
      
      // Update local state with new data
      if (updatedData && updatedData.length > 0) {
        setAdminData({
          ...adminData,
          nome: data.nome,
          email: data.email || adminData.email,
          telefone: data.telefone,
          studioName: data.studioName,
          avatar_url: data.avatar_url
        });
      }
      
      toast({
        title: "Perfil atualizado",
        description: "Suas informações foram atualizadas com sucesso.",
      });
      
      return true;
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast({
        title: "Erro ao atualizar perfil",
        description: error?.message || "Ocorreu um erro ao atualizar suas informações.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const onPasswordSubmit = async (data: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) => {
    try {
      const { error } = await signIn(user?.email || "admin@studio.com", data.currentPassword);
      
      if (error) {
        toast({
          title: "Senha atual incorreta",
          description: "Por favor, verifique sua senha atual e tente novamente.",
          variant: "destructive",
        });
        throw new Error("Senha atual incorreta");
      }
      
      const { error: updateError } = await supabase.auth.updateUser({
        password: data.newPassword
      });
      
      if (updateError) {
        toast({
          title: "Erro ao atualizar senha",
          description: updateError.message,
          variant: "destructive",
        });
        throw updateError;
      }
      
      toast({
        title: "Senha atualizada",
        description: "Sua senha foi atualizada com sucesso.",
      });
    } catch (error) {
      console.error("Error in password change:", error);
      throw error;
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 flex items-center justify-center h-48">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
          <p className="mt-2">Carregando perfil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Meu Perfil</h1>
          <p className="text-muted-foreground">
            Gerencie suas informações pessoais e senha
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-1">
          <ProfileAvatar 
            initialImage={adminData?.avatar_url} 
            onAvatarUpdate={async (url) => {
              if (adminData?.id && url !== undefined) {
                try {
                  console.log("Updating avatar_url to:", url);
                  const { error } = await supabase
                    .from('admins')
                    .update({ avatar_url: url })
                    .eq('id', adminData.id);
                    
                  if (error) {
                    console.error("Error updating avatar:", error);
                    throw error;
                  }
                  
                  // Update local state
                  setAdminData({
                    ...adminData,
                    avatar_url: url
                  });
                  
                  return true;
                } catch (error) {
                  console.error("Error updating avatar:", error);
                  throw error;
                }
              }
              return false;
            }}
          />
        </div>

        <div className="md:col-span-2">
          <div className="grid gap-6">
            <PersonalInfoForm
              defaultValues={{
                nome: adminData?.nome || "Sandy Yasmin",
                studioName: adminData?.studioName || adminData?.studio_name || "Studio Sandy Yasmin",
                email: adminData?.email || "admin@studio.com",
                telefone: adminData?.telefone || "+55 (11) 98765-4321",
              }}
              onSubmit={onProfileSubmit}
              isSubmitting={isSubmitting}
            />
            
            <PasswordChangeForm onSubmit={onPasswordSubmit} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
