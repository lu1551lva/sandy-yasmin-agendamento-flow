
import React from "react";
import { 
  Dialog, 
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

const DIAS_SEMANA = [
  { id: "domingo", label: "Domingo" },
  { id: "segunda", label: "Segunda-feira" },
  { id: "terca", label: "Terça-feira" },
  { id: "quarta", label: "Quarta-feira" },
  { id: "quinta", label: "Quinta-feira" },
  { id: "sexta", label: "Sexta-feira" },
  { id: "sabado", label: "Sábado" },
];

const HORARIOS = Array.from({ length: 25 }, (_, i) => {
  const hour = String(i).padStart(2, "0");
  return `${hour}:00`;
});

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  formData: any;
  errors: Record<string, string>;
  isEditing: boolean;
  onInputChange: (field: string, value: any) => void;
  onToggleDay: (d: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onReset: () => void;
}

const ProfessionalDialog = ({
  open,
  onOpenChange,
  formData,
  errors,
  isEditing,
  onInputChange,
  onToggleDay,
  onSubmit,
  onReset,
}: Props) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>{isEditing ? "Editar Profissional" : "Nova Profissional"}</DialogTitle>
        <DialogDescription>
          {isEditing 
            ? "Atualize as informações da profissional conforme necessário."
            : "Preencha os dados para cadastrar uma nova profissional."}
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={onSubmit} className="space-y-4 mt-4">
        <div className="space-y-2">
          <Label htmlFor="nome">Nome da Profissional</Label>
          <Input
            id="nome"
            value={formData.nome}
            onChange={e => onInputChange("nome", e.target.value)}
            placeholder="Ex: Sandy Yasmin"
            className={errors.nome ? "border-red-500" : ""}
          />
          {errors.nome && <p className="text-red-500 text-sm">{errors.nome}</p>}
        </div>

        <div className="space-y-2">
          <Label>Dias de Atendimento</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {DIAS_SEMANA.map((dia) => (
              <div key={dia.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`dia-${dia.id}`}
                  checked={formData.dias_atendimento.includes(dia.id)}
                  onCheckedChange={() => onToggleDay(dia.id)}
                />
                <label
                  htmlFor={`dia-${dia.id}`}
                  className="text-sm cursor-pointer"
                >
                  {dia.label}
                </label>
              </div>
            ))}
          </div>
          {errors.dias_atendimento && (
            <p className="text-red-500 text-sm">{errors.dias_atendimento}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="horario_inicio">Horário de Início</Label>
            <Select
              value={formData.horario_inicio}
              onValueChange={value => onInputChange("horario_inicio", value)}
            >
              <SelectTrigger
                id="horario_inicio"
                className={errors.horario_inicio ? "border-red-500" : ""}
              >
                <SelectValue placeholder="Selecione o horário" />
              </SelectTrigger>
              <SelectContent>
                {HORARIOS.filter((h) => {
                  const hour = parseInt(h.split(":")[0]);
                  return hour < 18;
                }).map((hora) => (
                  <SelectItem key={`inicio-${hora}`} value={hora}>
                    {hora}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.horario_inicio && (
              <p className="text-red-500 text-sm">{errors.horario_inicio}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="horario_fim">Horário de Término</Label>
            <Select
              value={formData.horario_fim}
              onValueChange={value => onInputChange("horario_fim", value)}
            >
              <SelectTrigger
                id="horario_fim"
                className={errors.horario_fim ? "border-red-500" : ""}
              >
                <SelectValue placeholder="Selecione o horário" />
              </SelectTrigger>
              <SelectContent>
                {HORARIOS.filter((h) => {
                  const hour = parseInt(h.split(":")[0]);
                  const startHour = parseInt(formData.horario_inicio.split(":")[0] || "0");
                  return hour > startHour;
                }).map((hora) => (
                  <SelectItem key={`fim-${hora}`} value={hora}>
                    {hora}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.horario_fim && (
              <p className="text-red-500 text-sm">{errors.horario_fim}</p>
            )}
          </div>
        </div>

        <DialogFooter className="pt-4">
          <DialogClose asChild>
            <Button type="button" variant="outline" onClick={onReset}>
              Cancelar
            </Button>
          </DialogClose>
          <Button type="submit">
            {isEditing ? "Atualizar" : "Cadastrar"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
);

export default ProfessionalDialog;
