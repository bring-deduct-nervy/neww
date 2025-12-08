import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { SeverityLevel } from "@/lib/types";
import { SEVERITY_CONFIG } from "@/lib/constants";

interface SeverityBadgeProps {
  severity: SeverityLevel;
  size?: 'sm' | 'md' | 'lg';
  showDot?: boolean;
}

export function SeverityBadge({ severity, size = 'md', showDot = true }: SeverityBadgeProps) {
  const config = SEVERITY_CONFIG[severity];

  return (
    <Badge
      variant="outline"
      className={cn(
        "font-medium border",
        config.bgColor,
        config.textColor,
        config.borderColor,
        size === 'sm' && 'text-xs px-2 py-0.5',
        size === 'md' && 'text-sm px-2.5 py-1',
        size === 'lg' && 'text-base px-3 py-1.5'
      )}
    >
      {showDot && (
        <span
          className={cn(
            "rounded-full mr-1.5",
            config.color,
            size === 'sm' && 'w-1.5 h-1.5',
            size === 'md' && 'w-2 h-2',
            size === 'lg' && 'w-2.5 h-2.5',
            severity === 'CRITICAL' && 'animate-pulse'
          )}
        />
      )}
      {config.label}
    </Badge>
  );
}
