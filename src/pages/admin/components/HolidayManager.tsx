
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format, parse, isValid } from "date-fns";
import { ptBR } from "date-fns/locale";
import { getHolidays, addHoliday, removeHoliday } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

const HolidayManager = () => {
  const [holidays, setHolidays] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  // Carregar feriados do localStorage
  useEffect(() => {
    setHolidays(getHolidays());
  }, []);

  // Adicionar um novo feriado
  const handleAddHoliday = () => {
    if (selectedDate) {
      const dateString = format(selectedDate, "yyyy-MM-dd");
      addHoliday(dateString);
      setHolidays(getHolidays());
    }
  };

  // Remover um feriado
  const handleRemoveHoliday = (dateString: string) => {
    removeHoliday(dateString);
    setHolidays(getHolidays());
  };

  // Formatar data para exibição
  const formatDisplayDate = (dateString: string) => {
    const date = parse(dateString, "yyyy-MM-dd", new Date());
    if (isValid(date)) {
      return format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
    }
    return dateString;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gerenciamento de Feriados</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium mb-4">Selecione uma data:</h3>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              locale={ptBR}
              className="rounded-md border shadow p-3 bg-white"
            />
            
            <Button 
              onClick={handleAddHoliday} 
              className="mt-4"
              disabled={!selectedDate}
            >
              Adicionar Feriado
            </Button>
          </div>
          
          <div>
            <h3 className="font-medium mb-4">Feriados cadastrados:</h3>
            {holidays.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Não há feriados cadastrados
              </div>
            ) : (
              <div className="space-y-2">
                {holidays.map((holiday) => (
                  <div key={holiday} className="flex items-center justify-between p-2 border rounded-md">
                    <span>{formatDisplayDate(holiday)}</span>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleRemoveHoliday(holiday)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        <div className="mt-6 p-4 bg-muted rounded-md">
          <p className="text-sm text-muted-foreground">
            Observação: Os feriados cadastrados aqui não impedem mais o agendamento. 
            Eles servem apenas como referência para você.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default HolidayManager;
