
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface AppointmentStatusChartProps {
  data: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  loading?: boolean;
}

export function AppointmentStatusChart({ data, loading = false }: AppointmentStatusChartProps) {
  const hasData = data && data.length > 0 && data.some(item => item.value > 0);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Status dos Agendamentos</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <Skeleton className="h-[250px] w-[250px] rounded-full" />
        </CardContent>
      </Card>
    );
  }

  if (!hasData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Status dos Agendamentos</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <p className="text-muted-foreground">Sem dados para mostrar</p>
        </CardContent>
      </Card>
    );
  }

  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
  }: {
    cx: number;
    cy: number;
    midAngle: number;
    innerRadius: number;
    outerRadius: number;
    percent: number;
  }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Status dos Agendamentos</CardTitle>
      </CardHeader>
      <CardContent className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomizedLabel}
              outerRadius={90}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number) => [`${value} agendamentos`, ""]}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
