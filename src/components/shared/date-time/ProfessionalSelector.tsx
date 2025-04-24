
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader } from "lucide-react";
import { Professional } from "@/lib/supabase";

interface ProfessionalSelectorProps {
  isLoading: boolean;
  error: string | null;
  professionals: Professional[];
  selectedProfessionalId: string;
  onProfessionalSelect: (id: string) => void;
}

export const ProfessionalSelector = ({
  isLoading,
  error,
  professionals,
  selectedProfessionalId,
  onProfessionalSelect,
}: ProfessionalSelectorProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Selecione o profissional:</CardTitle>
        <CardDescription>Escolha um profissional disponível.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <Label htmlFor="professional">Profissional</Label>
        {isLoading ? (
          <div className="flex items-center justify-center py-2">
            <Loader className="h-6 w-6 animate-spin" />
            <span className="ml-2">Carregando profissionais...</span>
          </div>
        ) : error ? (
          <div className="text-destructive py-2">{error}</div>
        ) : professionals.length === 0 ? (
          <div className="text-amber-600 py-2">
            Nenhum profissional disponível para esta data. Por favor, selecione outra data.
          </div>
        ) : (
          <Select onValueChange={onProfessionalSelect} value={selectedProfessionalId || ""}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecione um profissional" />
            </SelectTrigger>
            <SelectContent>
              {professionals.map((professional) => (
                <SelectItem key={professional.id} value={professional.id}>
                  {professional.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </CardContent>
    </Card>
  );
};
