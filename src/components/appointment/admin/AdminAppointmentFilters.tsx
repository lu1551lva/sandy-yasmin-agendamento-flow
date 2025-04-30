
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface AdminAppointmentFiltersProps {
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  professionalFilter: string;
  setProfessionalFilter: (value: string) => void;
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  professionals: any[];
}

export function AdminAppointmentFilters({
  selectedDate,
  setSelectedDate,
  professionalFilter,
  setProfessionalFilter,
  searchQuery,
  setSearchQuery,
  professionals,
}: AdminAppointmentFiltersProps) {
  return (
    <Card>
      <CardContent className="p-4 md:p-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {/* Date Picker */}
          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium">Data</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "justify-start text-left font-normal",
                    !selectedDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? (
                    format(selectedDate, "PPP", { locale: ptBR })
                  ) : (
                    <span>Selecionar data</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  initialFocus
                  locale={ptBR}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Professional Filter */}
          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium">Profissional</label>
            <Select
              value={professionalFilter}
              onValueChange={setProfessionalFilter}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos os profissionais" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os profissionais</SelectItem>
                {professionals.map((professional) => (
                  <SelectItem key={professional.id} value={professional.id}>
                    {professional.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Search */}
          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium">Buscar</label>
            <Input
              type="text"
              placeholder="Nome, telefone, serviço..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
