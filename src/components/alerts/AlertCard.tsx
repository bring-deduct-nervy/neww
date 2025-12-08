import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert } from "@/lib/types";
import { SEVERITY_CONFIG } from "@/lib/constants";
import {
  AlertTriangle,
  CloudRain,
  Mountain,
  Waves,
  Car,
  Megaphone,
  ChevronRight,
  Clock,
  MapPin
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface AlertCardProps {
  alert: Alert;
  onViewDetails?: () => void;
}

const alertTypeIcons: Record<string, React.ReactNode> = {
  WEATHER: <CloudRain className="h-5 w-5" />,
  FLOOD: <Waves className="h-5 w-5" />,
  LANDSLIDE: <Mountain className="h-5 w-5" />,
  DAM: <Waves className="h-5 w-5" />,
  EVACUATION: <AlertTriangle className="h-5 w-5" />,
  ROAD_CLOSURE: <Car className="h-5 w-5" />,
  GENERAL: <Megaphone className="h-5 w-5" />,
};

export function AlertCard({ alert, onViewDetails }: AlertCardProps) {
  const severityConfig = SEVERITY_CONFIG[alert.severity];
  const icon = alertTypeIcons[alert.type] || <AlertTriangle className="h-5 w-5" />;

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ scale: 1.01 }}
    >
      <Card className={cn(
        "glass-card border overflow-hidden",
        severityConfig.borderColor,
        alert.severity === 'CRITICAL' && "shake-alert"
      )}>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className={cn(
              "p-2 rounded-lg",
              severityConfig.bgColor,
              severityConfig.textColor
            )}>
              {icon}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="font-semibold">{alert.title}</h4>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {alert.message}
                  </p>
                </div>
                <Badge className={cn("text-white shrink-0", severityConfig.color)}>
                  {severityConfig.label}
                </Badge>
              </div>

              <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatTime(alert.startsAt)}
                </span>
                {alert.districts.length > 0 && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {alert.districts.slice(0, 2).join(', ')}
                    {alert.districts.length > 2 && ` +${alert.districts.length - 2}`}
                  </span>
                )}
                <span className="text-muted-foreground/60">
                  Source: {alert.source}
                </span>
              </div>

              {onViewDetails && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-2 -ml-2 text-cyan-400 hover:text-cyan-300"
                  onClick={onViewDetails}
                >
                  View Details
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
