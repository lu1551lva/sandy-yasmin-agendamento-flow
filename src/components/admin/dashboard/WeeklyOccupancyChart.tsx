
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface WeeklyOccupancyChartProps {
  data: Array<{
    name: string;
    ocupados: number;
    disponiveis: number;
  }>;
  loading?: boolean;
}

export function WeeklyOccupancyChart({ data, loading = false }: WeeklyOccupancyChartProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Ocupação Semanal</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <Skeleton className="h-[250px] w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Ocupação Semanal</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <p className="text-muted-foreground">Sem dados para mostrar</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ocupação Semanal</CardTitle>
      </CardHeader>
      <CardContent className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{
              top: 20,
              right: 30,
              left: 0,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip formatter={(value) => [`${value} horários`, ""]} />
            <Legend />
            <Bar dataKey="ocupados" name="Ocupados" fill="#8884d8" />
            <Bar dataKey="disponiveis" name="Disponíveis" fill="#82ca9d" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
