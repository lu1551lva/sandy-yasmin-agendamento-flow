
import * as React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: LucideIcon;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  tooltip?: string;
}

export const IconButton = ({
  icon: Icon,
  variant = "default",
  size = "icon",
  className,
  tooltip,
  ...props
}: IconButtonProps) => {
  const button = (
    <Button
      variant={variant}
      size={size}
      className={cn("p-0 h-8 w-8 rounded-full", className)}
      {...props}
    >
      <Icon className="h-4 w-4" />
    </Button>
  );

  if (tooltip) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {button}
          </TooltipTrigger>
          <TooltipContent>
            <p>{tooltip}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return button;
};

// Export a more specific version for common use cases
export const ActionIconButton = ({
  icon,
  onClick,
  label,
  variant = "ghost",
  tooltip,
  ...props
}: {
  icon: LucideIcon;
  onClick?: () => void;
  label: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  tooltip?: string;
}) => {
  return (
    <IconButton
      icon={icon}
      onClick={onClick}
      aria-label={label}
      variant={variant}
      tooltip={tooltip}
      {...props}
    />
  );
};
