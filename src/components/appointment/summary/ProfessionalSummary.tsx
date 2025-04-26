
interface ProfessionalSummaryProps {
  professionalName: string;
}

const ProfessionalSummary = ({ professionalName }: ProfessionalSummaryProps) => {
  if (!professionalName) return null;
  
  return (
    <div>
      <h3 className="font-medium">Profissional</h3>
      <p>{professionalName}</p>
    </div>
  );
};

export default ProfessionalSummary;
