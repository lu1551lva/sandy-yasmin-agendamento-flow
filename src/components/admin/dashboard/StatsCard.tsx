
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: number;
  description?: string;
  icon?: LucideIcon;
}

export const StatsCard = ({ title, value, description, icon: Icon }: StatsCardProps) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex items-center">
        {Icon && <Icon className="h-4 w-4 mr-2 text-primary" />}
        <div>
          <div className="text-2xl font-bold">{value}</div>
          {description && (
            <div className="text-xs text-muted-foreground mt-1">{description}</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
