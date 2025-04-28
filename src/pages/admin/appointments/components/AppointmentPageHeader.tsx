
interface AppointmentPageHeaderProps {
  title: string;
  description: string;
}

export function AppointmentPageHeader({
  title,
  description
}: AppointmentPageHeaderProps) {
  return (
    <div>
      <h1 className="text-3xl font-semibold mb-2 font-playfair">{title}</h1>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}
