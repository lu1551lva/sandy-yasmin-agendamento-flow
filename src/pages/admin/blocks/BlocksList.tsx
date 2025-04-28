
import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useBlocks } from "./hooks/useBlocks";
import BlockForm from "./BlockForm";
import { Block } from "./types";

export default function BlocksList() {
  const [showForm, setShowForm] = useState(false);
  const [editingBlock, setEditingBlock] = useState<Block | null>(null);
  const { blocks, isLoading, deleteBlock } = useBlocks();

  const handleEdit = (block: Block) => {
    setEditingBlock(block);
    setShowForm(true);
  };

  const handleClose = () => {
    setShowForm(false);
    setEditingBlock(null);
  };

  const formatBlockPeriod = (block: Block) => {
    const startDate = format(new Date(block.data_inicio), "dd/MM/yyyy", { locale: ptBR });
    const endDate = format(new Date(block.data_fim), "dd/MM/yyyy", { locale: ptBR });
    
    const timeInfo = block.hora_inicio && block.hora_fim 
      ? ` (${block.hora_inicio} - ${block.hora_fim})`
      : " (Dia inteiro)";

    return startDate === endDate
      ? `${startDate}${timeInfo}`
      : `${startDate} até ${endDate}${timeInfo}`;
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-semibold font-playfair">Bloqueios</h2>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Bloqueio
        </Button>
      </div>

      {showForm && (
        <BlockForm
          block={editingBlock}
          onClose={handleClose}
        />
      )}

      <div className="grid gap-4">
        {blocks.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              Nenhum bloqueio cadastrado
            </CardContent>
          </Card>
        ) : (
          blocks.map((block) => (
            <Card key={block.id}>
              <CardHeader>
                <CardTitle className="text-lg">{formatBlockPeriod(block)}</CardTitle>
                {block.observacao && (
                  <CardDescription>{block.observacao}</CardDescription>
                )}
              </CardHeader>
              <CardContent className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => handleEdit(block)}>
                  Editar
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={() => deleteBlock(block.id)}
                >
                  Excluir
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
