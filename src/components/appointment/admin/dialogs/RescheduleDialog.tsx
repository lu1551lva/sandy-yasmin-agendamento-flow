
import { useState } from "react";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface RescheduleDialogProps {
  showDialog: boolean;
  setShowDialog: (show: boolean) => void;
  onReschedule: (date: string, time: string) => void;
  isLoading: boolean;
}

export function RescheduleDialog({
  showDialog,
  setShowDialog,
  onReschedule,
  isLoading
}: RescheduleDialogProps) {
  const [rescheduleDate, setRescheduleDate] = useState<Date | undefined>(undefined);
  const [rescheduleTime, setRescheduleTime] = useState<string>("");
  
  const timeSlots = ["08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", 
                     "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30",
                     "16:00", "16:30", "17:00", "17:30", "18:00", "18:30", "19:00", "19:30"];

  const handleReschedule = () => {
    if (!rescheduleDate || !rescheduleTime) return;
    
    const formattedDate = format(rescheduleDate, "yyyy-MM-dd");
    onReschedule(formattedDate, rescheduleTime);
    
    // Reset form
    setRescheduleDate(undefined);
    setRescheduleTime("");
  };

  return (
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Reagendar</DialogTitle>
          <DialogDescription>
            Escolha uma nova data e horário para o agendamento.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Nova Data</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !rescheduleDate && "text-muted-foreground"
                  )}
                  disabled={isLoading}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {rescheduleDate ? format(rescheduleDate, "dd/MM/yyyy") : <span>Selecionar data</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={rescheduleDate}
                  onSelect={setRescheduleDate}
                  initialFocus
                  disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <div className="space-y-2">
            <Label>Novo Horário</Label>
            <Select
              value={rescheduleTime}
              onValueChange={setRescheduleTime}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um horário" />
              </SelectTrigger>
              <SelectContent>
                {timeSlots.map((time) => (
                  <SelectItem key={time} value={time}>
                    {time}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => setShowDialog(false)} disabled={isLoading}>
            Cancelar
          </Button>
          <Button 
            onClick={handleReschedule} 
            disabled={isLoading || !rescheduleDate || !rescheduleTime}
          >
            {isLoading ? "Reagendando..." : "Confirmar Reagendamento"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
