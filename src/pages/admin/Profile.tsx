
import { useAuth } from "@/context/auth-context";
import { supabase } from "@/lib/supabase";
import { ProfileAvatar } from "@/components/admin/ProfileAvatar";
import { PersonalInfoForm } from "@/components/admin/PersonalInfoForm";
import { PasswordChangeForm } from "@/components/admin/PasswordChangeForm";

const Profile = () => {
  const { user, signIn } = useAuth();

  const onProfileSubmit = async (data: {
    nome: string;
    studioName: string;
    email?: string;
    telefone: string;
  }) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
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
          <ProfileAvatar />
        </div>

        <div className="md:col-span-2">
          <div className="grid gap-6">
            <PersonalInfoForm
              defaultValues={{
                nome: "Sandy Yasmin",
                studioName: "Studio Sandy Yasmin",
                email: user?.email || "admin@studio.com",
                telefone: "(11) 98765-4321",
              }}
              onSubmit={onProfileSubmit}
            />
            
            <PasswordChangeForm onSubmit={onPasswordSubmit} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
