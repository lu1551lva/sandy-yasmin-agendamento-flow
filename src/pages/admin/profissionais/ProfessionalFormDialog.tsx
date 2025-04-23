
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { ProfessionalFormData } from "./hooks/useProfessionalForm";

const DIAS_SEMANA = [
  { id: "domingo", label: "Domingo" },
  { id: "segunda", label: "Segunda-feira" },
  { id: "terca", label: "Terça-feira" },
  { id: "quarta", label: "Quarta-feira" },
  { id: "quinta", label: "Quinta-feira" },
  { id: "sexta", label: "Sexta-feira" },
  { id: "sabado", label: "Sábado" },
];

const HORARIOS = Array.from({ length: 25 }, (_, i) => `${String(i).padStart(2, "0")}:00`);

interface Props {
  open: boolean;
  isEditing: boolean;
  form: ProfessionalFormData;
  errors: Record<string, string>;
  onChange: (field: keyof ProfessionalFormData, value: any) => void;
  onToggleDay: (dia: string) => void;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

const ProfessionalFormDialog = ({
  open, isEditing, form, errors, onChange, onToggleDay, onClose, onSubmit
}: Props) => (
  <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>
          {isEditing ? "Editar Profissional" : "Nova Profissional"}
        </DialogTitle>
      </DialogHeader>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <Label htmlFor="nome">Nome</Label>
          <Input
            id="nome"
            value={form.nome}
            onChange={e => onChange("nome", e.target.value)}
            className={errors.nome ? "border-red-500" : ""}
            required
          />
          {errors.nome && <p className="text-xs text-destructive">{errors.nome}</p>}
        </div>
        <div>
          <Label>Dias de Atendimento</Label>
          <div className="flex flex-wrap gap-2">
            {DIAS_SEMANA.map(dia => (
              <div key={dia.id} className="flex items-center gap-1">
                <Checkbox
                  id={dia.id}
                  checked={form.dias_atendimento.includes(dia.id)}
                  onCheckedChange={() => onToggleDay(dia.id)}
                />
                <label htmlFor={dia.id} className="text-sm cursor-pointer">{dia.label}</label>
              </div>
            ))}
          </div>
          {errors.dias_atendimento && <p className="text-xs text-destructive">{errors.dias_atendimento}</p>}
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label>Hora Início</Label>
            <Select value={form.horario_inicio} onValueChange={v => onChange("horario_inicio", v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {HORARIOS.filter(h => parseInt(h) < 18).map(hora => (
                  <SelectItem key={hora} value={hora}>
                    {hora}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.horario_inicio && <p className="text-xs text-destructive">{errors.horario_inicio}</p>}
          </div>
          <div>
            <Label>Hora Fim</Label>
            <Select value={form.horario_fim} onValueChange={v => onChange("horario_fim", v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {HORARIOS.filter(h => parseInt(h) > parseInt(form.horario_inicio.split(":")[0])).map(hora => (
                  <SelectItem key={hora} value={hora}>
                    {hora}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.horario_fim && <p className="text-xs text-destructive">{errors.horario_fim}</p>}
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit">{isEditing ? "Salvar" : "Cadastrar"}</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
);

export default ProfessionalFormDialog;
