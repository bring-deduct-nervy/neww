import { Button } from "@/components/ui/button";
import { X, AlertTriangle, AlertCircle, Info, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface AlertBannerProps {
  type: 'critical' | 'warning' | 'info' | 'success';
  title: string;
  message: string;
  dismissible?: boolean;
  onDismiss?: () => void;
  action?: {
    label: string;
    onClick: () => void;
  };
  sticky?: boolean;
}

const alertStyles = {
  critical: {
    container: "bg-red-600 text-white border-red-700",
    icon: AlertTriangle,
    iconClass: "text-white"
  },
  warning: {
    container: "bg-orange-500 text-white border-orange-600",
    icon: AlertCircle,
    iconClass: "text-white"
  },
  info: {
    container: "bg-cyan-500 text-white border-cyan-600",
    icon: Info,
    iconClass: "text-white"
  },
  success: {
    container: "bg-green-500 text-white border-green-600",
    icon: CheckCircle,
    iconClass: "text-white"
  }
};

export function AlertBanner({
  type,
  title,
  message,
  dismissible = true,
  onDismiss,
  action,
  sticky = true
}: AlertBannerProps) {
  const styles = alertStyles[type];
  const Icon = styles.icon;

  return (
    <div
      className={cn(
        "w-full px-4 py-3 flex items-center gap-3 slide-up",
        styles.container,
        sticky && "sticky top-0 z-50",
        type === 'critical' && "shake-alert"
      )}
    >
      <Icon className={cn("h-5 w-5 flex-shrink-0", styles.iconClass)} />

      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm">{title}</p>
        <p className="text-sm opacity-90 truncate">{message}</p>
      </div>

      {action && (
        <Button
          variant="secondary"
          size="sm"
          onClick={action.onClick}
          className="flex-shrink-0 bg-white/20 hover:bg-white/30 text-white border-0"
        >
          {action.label}
        </Button>
      )}

      {dismissible && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onDismiss}
          className="flex-shrink-0 text-white hover:bg-white/20"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
