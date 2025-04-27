
import { useAuth } from "@/context/auth-context";
import { supabase } from "@/lib/supabase";
import { useState } from "react";
import { ProfileAvatar } from "@/components/admin/ProfileAvatar";
import { PersonalInfoForm } from "@/components/admin/PersonalInfoForm";
import { PasswordChangeForm } from "@/components/admin/PasswordChangeForm";

const Profile = () => {
  const { user, signIn } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onProfileSubmit = async (data: {
    nome: string;
    studioName: string;
    email?: string;
    telefone: string;
    avatar_url?: string;
  }) => {
    setIsSubmitting(true);
    
    try {
      // Check if user exists before updating
      if (!user?.id) {
        throw new Error("Usuário não encontrado");
      }
      
      // Update the user profile in the database
      const { error } = await supabase
        .from('admins')
        .update({
          nome: data.nome,
          email: data.email,
          telefone: data.telefone,
          avatar_url: data.avatar_url
        })
        .eq('id', user.id);
        
      if (error) {
        throw error;
      }
      
      // If we reach this point, the update was successful
      return true;
    } catch (error) {
      console.error("Error updating profile:", error);
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
    const { error } = await signIn(user?.email || "admin@studio.com", data.currentPassword);
    
    if (error) {
      throw new Error("Senha atual incorreta");
    }
    
    const { error: updateError } = await supabase.auth.updateUser({
      password: data.newPassword
    });
    
    if (updateError) {
      throw updateError;
    }
  };

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
            initialImage={user?.user_metadata?.avatar_url} 
            onAvatarUpdate={async (url) => {
              if (user?.id && url) {
                try {
                  const { error } = await supabase
                    .from('admins')
                    .update({ avatar_url: url })
                    .eq('id', user.id);
                    
                  if (error) throw error;
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
                nome: user?.user_metadata?.nome || "Sandy Yasmin",
                studioName: user?.user_metadata?.studioName || "Studio Sandy Yasmin",
                email: user?.email || "admin@studio.com",
                telefone: user?.user_metadata?.telefone || "+55 (11) 98765-4321",
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
