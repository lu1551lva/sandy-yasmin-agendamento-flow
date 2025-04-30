
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ReactNode } from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface StatsCardProps {
  title: string;
  value: number;
  valuePrefix?: string;
  description?: string;
  icon?: ReactNode;
  trend?: number;
  loading?: boolean;
}

export const StatsCard = ({ 
  title, 
  value, 
  valuePrefix = "", 
  description, 
  icon, 
  trend, 
  loading = false 
}: StatsCardProps) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex items-center gap-2">
        {icon}
        <div>
          {loading ? (
            <Skeleton className="h-8 w-24" />
          ) : (
            <div className="text-2xl font-bold">
              {valuePrefix}{typeof value === 'number' && value % 1 === 0 ? value : value.toFixed(2)}
            </div>
          )}
          {description && (
            <div className="text-xs text-muted-foreground mt-1">{description}</div>
          )}
          {trend !== undefined && (
            <div className="text-xs text-muted-foreground mt-1">
              <span className={trend >= 0 ? "text-green-600" : "text-red-600"}>
                {trend >= 0 ? "+" : ""}{trend}%
              </span>
              {" "}vs. mês anterior
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
