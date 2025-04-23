
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, LayoutGrid, List } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Props {
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  professionals?: any[];
  professionalFilter: string;
  setProfessionalFilter: (id: string) => void;
  viewType: "grid" | "list";
  setViewType: (type: "grid" | "list") => void;
}

const ScheduleHeader = ({
  selectedDate,
  setSelectedDate,
  professionals,
  professionalFilter,
  setProfessionalFilter,
  viewType,
  setViewType,
}: Props) => {
  return (
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
      <span className="font-semibold text-lg">Agenda da Semana</span>
      <div className="flex items-center space-x-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="justify-start text-left">
              <CalendarIcon className="mr-2 h-4 w-4" />
              {format(selectedDate, "dd/MM/yyyy")}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 pointer-events-auto">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              initialFocus
              locale={ptBR}
              className="pointer-events-auto"
            />
          </PopoverContent>
        </Popover>
        <Select value={professionalFilter} onValueChange={setProfessionalFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Profissional" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os profissionais</SelectItem>
            {professionals?.map((pro: any) => (
              <SelectItem key={pro.id} value={pro.id}>
                {pro.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Tabs value={viewType} onValueChange={(v) => setViewType(v as "grid" | "list")}>
          <TabsList>
            <TabsTrigger value="grid">
              <LayoutGrid className="h-4 w-4 mr-1" /> Grade
            </TabsTrigger>
            <TabsTrigger value="list">
              <List className="h-4 w-4 mr-1" /> Lista
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </div>
  );
};

export default ScheduleHeader;
