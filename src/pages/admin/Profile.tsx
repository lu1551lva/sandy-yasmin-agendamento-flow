
import LoadingSpinner from "@/components/admin/profile/LoadingSpinner";
import ProfileHeader from "@/components/admin/profile/ProfileHeader";
import ProfileContent from "@/components/admin/profile/ProfileContent";
import { useAdminProfile } from "@/hooks/useAdminProfile";

const Profile = () => {
  const { adminData, setAdminData, isLoading } = useAdminProfile();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="container mx-auto py-6">
      <ProfileHeader 
        title="Meu Perfil"
        description="Gerencie suas informações pessoais e senha"
      />
      {adminData && (
        <ProfileContent 
          adminData={adminData}
          setAdminData={setAdminData}
        />
      )}
    </div>
  );
};

export default Profile;
