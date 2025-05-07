
import * as React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: LucideIcon;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
}

export const IconButton = ({
  icon: Icon,
  variant = "default",
  size = "icon",
  className,
  ...props
}: IconButtonProps) => {
  return (
    <Button
      variant={variant}
      size={size}
      className={cn("p-0 h-8 w-8 rounded-full", className)}
      {...props}
    >
      <Icon className="h-4 w-4" />
    </Button>
  );
};
