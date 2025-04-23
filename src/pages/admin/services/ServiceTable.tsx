
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import { Service } from "@/lib/supabase";

interface ServiceTableProps {
  services: Service[] | undefined;
  isLoading: boolean;
  onEdit: (service: Service) => void;
  onDelete: (service: Service) => void;
  openNewServiceDialog: () => void;
  formatCurrency: (value: number) => string;
}

const ServiceTable = ({
  services,
  isLoading,
  onEdit,
  onDelete,
  openNewServiceDialog,
  formatCurrency,
}: ServiceTableProps) => {
  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!services || services.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground mb-4">
          Não há serviços cadastrados.
        </p>
        <Button onClick={openNewServiceDialog}>Adicionar Serviço</Button>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Valor</TableHead>
            <TableHead>Duração</TableHead>
            <TableHead className="w-[100px]">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {services.map((service) => (
            <TableRow key={service.id}>
              <TableCell className="font-medium">{service.nome}</TableCell>
              <TableCell>{formatCurrency(service.valor)}</TableCell>
              <TableCell>{service.duracao_em_minutos} minutos</TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => onEdit(service)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => onDelete(service)}
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
  );
};

export default ServiceTable;
