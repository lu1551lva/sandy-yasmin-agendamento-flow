
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Edit, Trash2 } from "lucide-react";
import { Professional } from "@/lib/supabase";
import React from "react";
import { Badge } from "@/components/ui/badge";

interface ProfessionalTableProps {
  professionals: Professional[];
  isLoading: boolean;
  onEdit: (professional: Professional) => void;
  onDelete: (professional: Professional) => void;
  formatDiasAtendimento: (dias: string[]) => string;
  onAddProfessional: () => void;
}

const ProfessionalTable: React.FC<ProfessionalTableProps> = ({
  professionals,
  isLoading,
  onEdit,
  onDelete,
  formatDiasAtendimento,
  onAddProfessional,
}) => {
  // Lista completa dos dias da semana para verificar disponibilidade
  const diasSemana = ["domingo", "segunda", "terca", "quarta", "quinta", "sexta", "sabado"];
  const diasSemanaCompletos = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

  // Função para renderizar badges dos dias de atendimento
  const renderDiasBadges = (dias: string[]) => {
    return (
      <div className="flex flex-wrap gap-1">
        {diasSemana.map((dia, index) => (
          <Badge 
            key={dia}
            variant={dias.includes(dia) ? "default" : "outline"} 
            className={!dias.includes(dia) ? "opacity-40" : ""}
          >
            {diasSemanaCompletos[index]}
          </Badge>
        ))}
      </div>
    );
  };

  return (
    <div>
      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : professionals && professionals.length > 0 ? (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Dias de Atendimento</TableHead>
                <TableHead>Horários</TableHead>
                <TableHead className="w-[100px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {professionals.map((professional) => (
                <TableRow key={professional.id}>
                  <TableCell className="font-medium">
                    {professional.nome}
                  </TableCell>
                  <TableCell>
                    {renderDiasBadges(professional.dias_atendimento)}
                  </TableCell>
                  <TableCell>
                    {professional.horario_inicio} às {professional.horario_fim}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => onEdit(professional)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => onDelete(professional)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-muted-foreground mb-4">
            Não há profissionais cadastradas.
          </p>
          <Button onClick={onAddProfessional}>
            Adicionar Profissional
          </Button>
        </div>
      )}
    </div>
  );
};

export default ProfessionalTable;
