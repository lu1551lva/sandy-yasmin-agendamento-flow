
import { AdminData } from "@/hooks/useAdminProfile";
import { ProfileAvatar } from "@/components/admin/ProfileAvatar";
import { PersonalInfoForm } from "@/components/admin/PersonalInfoForm";
import { PasswordChangeForm } from "@/components/admin/PasswordChangeForm";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/auth-context";

interface ProfileContentProps {
  adminData: AdminData;
  setAdminData: (data: AdminData) => void;
}

const ProfileContent = ({ adminData, setAdminData }: ProfileContentProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { signIn } = useAuth();

  const onProfileSubmit = async (data: {
    nome: string;
    studioName: string;
    email?: string;
    telefone: string;
    avatar_url?: string;
  }) => {
    setIsSubmitting(true);
    
    try {
      if (!adminData?.id) {
        throw new Error("Dados do administrador não encontrados");
      }

      console.log("Updating admin data with:", {
        nome: data.nome,
        telefone: data.telefone,
        studio_name: data.studioName,
        avatar_url: data.avatar_url
      });
      
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
      const { error } = await signIn(adminData?.email || "admin@studio.com", data.currentPassword);
      
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

  return (
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
  );
};

export default ProfileContent;
