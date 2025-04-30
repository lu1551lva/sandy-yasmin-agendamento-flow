
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ReactNode } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, TrendingDown } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: number;
  valuePrefix?: string;
  description?: string;
  icon?: ReactNode;
  trend?: number;
  loading?: boolean;
  valueFormatFn?: (value: number) => string;
  trendColor?: "green" | "red" | "auto";
}

export const StatsCard = ({ 
  title, 
  value, 
  valuePrefix = "", 
  description, 
  icon, 
  trend, 
  loading = false,
  valueFormatFn,
  trendColor = "auto"
}: StatsCardProps) => {
  // Format the value - always display integers as integers, and decimals with 2 places
  let formattedValue;
  
  if (valueFormatFn) {
    formattedValue = valueFormatFn(value);
  } else {
    formattedValue = typeof value === 'number' ? 
      (value % 1 === 0 ? value.toString() : value.toFixed(2)) : 
      '0';
  }
    
  // For debugging
  console.log(`💳 Rendering StatsCard - ${title}: ${valuePrefix}${formattedValue}`);

  // Determine trend color
  let trendColorClass = "";
  if (trendColor === "auto") {
    trendColorClass = trend && trend >= 0 ? "text-green-600" : "text-red-600";
  } else if (trendColor === "green") {
    trendColorClass = "text-green-600";
  } else if (trendColor === "red") {
    trendColorClass = "text-red-600";
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2 border-b">
        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
          <span>{title}</span>
          {icon && <span className="text-primary">{icon}</span>}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        {loading ? (
          <Skeleton className="h-8 w-24" />
        ) : (
          <>
            <div className="text-2xl font-bold">
              {valuePrefix}{formattedValue}
            </div>
            {description && (
              <div className="text-xs text-muted-foreground mt-1">{description}</div>
            )}
            {trend !== undefined && (
              <div className="flex items-center mt-2">
                {trend >= 0 ? (
                  <TrendingUp className={`h-4 w-4 mr-1 ${trendColorClass}`} />
                ) : (
                  <TrendingDown className={`h-4 w-4 mr-1 ${trendColorClass}`} />
                )}
                <span className={`text-xs ${trendColorClass}`}>
                  {trend >= 0 ? "+" : ""}{trend}% vs. mês anterior
                </span>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};
