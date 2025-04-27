
interface ProfileHeaderProps {
  title: string;
  description: string;
}

const ProfileHeader = ({ title, description }: ProfileHeaderProps) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        <p className="text-muted-foreground">{description}</p>
      </div>
    </div>
  );
};

export default ProfileHeader;
