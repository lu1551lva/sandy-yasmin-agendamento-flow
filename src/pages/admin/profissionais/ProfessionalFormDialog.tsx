
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { ProfessionalFormData } from "./types/professional-state";

const DIAS_SEMANA = [
  { id: "domingo", label: "Domingo" },
  { id: "segunda", label: "Segunda-feira" },
  { id: "terca", label: "Terça-feira" },
  { id: "quarta", label: "Quarta-feira" },
  { id: "quinta", label: "Quinta-feira" },
  { id: "sexta", label: "Sexta-feira" },
  { id: "sabado", label: "Sábado" },
];

// Gera horários de 00:00 a 23:00
const HORARIOS = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, "0")}:00`);

interface Props {
  open: boolean;
  isEditing: boolean;
  form: ProfessionalFormData;
  errors: Record<string, string>;
  isSubmitting?: boolean;
  onChange: (field: keyof ProfessionalFormData, value: any) => void;
  onToggleDay: (dia: string) => void;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

const ProfessionalFormDialog = ({
  open, 
  isEditing, 
  form, 
  errors, 
  isSubmitting = false,
  onChange, 
  onToggleDay, 
  onClose, 
  onSubmit
}: Props) => {
  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) onClose();
    }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar Profissional" : "Novo Profissional"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4 py-2">
          <div>
            <Label htmlFor="nome">Nome</Label>
            <Input
              id="nome"
              value={form.nome}
              onChange={e => onChange("nome", e.target.value)}
              className={errors.nome ? "border-red-500" : ""}
              placeholder="Nome do profissional"
              disabled={isSubmitting}
            />
            {errors.nome && <p className="text-xs text-destructive mt-1">{errors.nome}</p>}
          </div>
          
          <div>
            <Label className="mb-2 block">Dias de Atendimento</Label>
            <div className="grid grid-cols-2 gap-2">
              {DIAS_SEMANA.map(dia => (
                <div key={dia.id} className="flex items-center gap-1">
                  <Checkbox
                    id={dia.id}
                    checked={Array.isArray(form.dias_atendimento) && form.dias_atendimento.includes(dia.id)}
                    onCheckedChange={() => onToggleDay(dia.id)}
                    disabled={isSubmitting}
                  />
                  <label htmlFor={dia.id} className="text-sm cursor-pointer">{dia.label}</label>
                </div>
              ))}
            </div>
            {errors.dias_atendimento && <p className="text-xs text-destructive mt-1">{errors.dias_atendimento}</p>}
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Hora Início</Label>
              <Select 
                value={form.horario_inicio} 
                onValueChange={v => onChange("horario_inicio", v)}
                disabled={isSubmitting}
              >
                <SelectTrigger className={errors.horario_inicio ? "border-red-500" : ""}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {HORARIOS.map(hora => (
                    <SelectItem key={`inicio-${hora}`} value={hora}>
                      {hora}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.horario_inicio && <p className="text-xs text-destructive mt-1">{errors.horario_inicio}</p>}
            </div>
            
            <div>
              <Label>Hora Fim</Label>
              <Select 
                value={form.horario_fim} 
                onValueChange={v => onChange("horario_fim", v)}
                disabled={isSubmitting}
              >
                <SelectTrigger className={errors.horario_fim ? "border-red-500" : ""}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {HORARIOS.filter(h => {
                    const horaInicio = parseInt(form.horario_inicio.split(":")[0]);
                    const hora = parseInt(h.split(":")[0]);
                    return hora > horaInicio;
                  }).map(hora => (
                    <SelectItem key={`fim-${hora}`} value={hora}>
                      {hora}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.horario_fim && <p className="text-xs text-destructive mt-1">{errors.horario_fim}</p>}
            </div>
          </div>
          
          <DialogFooter className="pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              className="mr-2"
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
            >
              {isSubmitting ? "Salvando..." : (isEditing ? "Salvar" : "Cadastrar")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProfessionalFormDialog;
