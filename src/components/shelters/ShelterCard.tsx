import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  Navigation,
  Phone,
  Users,
  Wifi,
  Zap,
  Droplets,
  Utensils,
  Heart,
  Accessibility
} from "lucide-react";
import { Shelter } from "@/lib/types";
import { SHELTER_STATUS_CONFIG } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface ShelterCardProps {
  shelter: Shelter;
  onNavigate?: () => void;
  onCall?: () => void;
}

const facilityIcons: Record<string, { icon: React.ReactNode; label: string }> = {
  hasMedical: { icon: <Heart className="h-4 w-4" />, label: "Medical" },
  hasFood: { icon: <Utensils className="h-4 w-4" />, label: "Food" },
  hasWater: { icon: <Droplets className="h-4 w-4" />, label: "Water" },
  hasElectricity: { icon: <Zap className="h-4 w-4" />, label: "Power" },
  hasInternet: { icon: <Wifi className="h-4 w-4" />, label: "WiFi" },
  isAccessible: { icon: <Accessibility className="h-4 w-4" />, label: "Accessible" },
};

export function ShelterCard({ shelter, onNavigate, onCall }: ShelterCardProps) {
  const status = SHELTER_STATUS_CONFIG[shelter.status];
  const occupancyPercent = Math.round(
    (shelter.currentOccupancy / shelter.totalCapacity) * 100
  );

  const facilities = Object.entries(shelter.facilities)
    .filter(([_, value]) => value)
    .map(([key]) => key);

  const handleNavigate = () => {
    if (onNavigate) {
      onNavigate();
    } else {
      window.open(
        `https://www.google.com/maps/dir/?api=1&destination=${shelter.latitude},${shelter.longitude}`,
        '_blank'
      );
    }
  };

  const handleCall = () => {
    if (onCall) {
      onCall();
    } else if (shelter.contact?.phone) {
      window.location.href = `tel:${shelter.contact.phone}`;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="glass-card border-white/10 overflow-hidden">
        <CardContent className="p-4">
          <div className="flex justify-between items-start mb-3">
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold truncate">{shelter.name}</h4>
              <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                <MapPin className="h-3 w-3" />
                <span className="truncate">{shelter.address}</span>
              </p>
            </div>
            <Badge className={cn("text-white ml-2", status.color)}>
              {status.label}
            </Badge>
          </div>

          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
            {shelter.distance !== undefined && (
              <span className="flex items-center gap-1">
                <Navigation className="h-3.5 w-3.5 text-cyan-400" />
                {shelter.distance.toFixed(1)} km
              </span>
            )}
            <span className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5 text-cyan-400" />
              {shelter.currentOccupancy}/{shelter.totalCapacity}
            </span>
          </div>

          {/* Capacity bar */}
          <div className="mb-3">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-muted-foreground">Capacity</span>
              <span className={cn(
                occupancyPercent >= 90 ? "text-red-400" :
                occupancyPercent >= 70 ? "text-yellow-400" : "text-green-400"
              )}>
                {shelter.availableSpace} spots available
              </span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className={cn(
                  "h-full transition-all",
                  occupancyPercent < 50 && "bg-green-500",
                  occupancyPercent >= 50 && occupancyPercent < 80 && "bg-yellow-500",
                  occupancyPercent >= 80 && "bg-red-500"
                )}
                initial={{ width: 0 }}
                animate={{ width: `${occupancyPercent}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>

          {/* Facilities */}
          <div className="flex flex-wrap gap-2 mb-4">
            {facilities.map((facility) => {
              const facilityInfo = facilityIcons[facility];
              if (!facilityInfo) return null;
              return (
                <div
                  key={facility}
                  className="flex items-center gap-1 px-2 py-1 bg-white/5 rounded-md text-xs"
                  title={facilityInfo.label}
                >
                  <span className="text-cyan-400">{facilityInfo.icon}</span>
                  <span className="text-muted-foreground">{facilityInfo.label}</span>
                </div>
              );
            })}
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            {shelter.contact?.phone && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleCall}
                className="flex-1 border-white/20 hover:bg-white/10"
              >
                <Phone className="h-4 w-4 mr-1" />
                Call
              </Button>
            )}
            <Button
              size="sm"
              className="flex-1 bg-cyan-600 hover:bg-cyan-500 glow-primary"
              onClick={handleNavigate}
            >
              <Navigation className="h-4 w-4 mr-1" />
              Directions
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
