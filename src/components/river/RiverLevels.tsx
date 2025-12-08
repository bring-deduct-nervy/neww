import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RiverLevel, RiverStatus } from "@/lib/types";
import { supabase } from "@/lib/supabase";
import { realtimeService } from "@/lib/api/realtime-service";
import { Waves, TrendingUp, TrendingDown, Minus, AlertTriangle, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

// Fallback river level data for Sri Lanka
const fallbackRiverLevels: RiverLevel[] = [
  {
    id: '1',
    riverName: 'Kelani River',
    stationName: 'Nagalagam Street',
    district: 'Colombo',
    latitude: 6.9344,
    longitude: 79.8728,
    currentLevel: 5.8,
    warningLevel: 5.0,
    dangerLevel: 6.0,
    status: 'DANGER',
    recordedAt: new Date()
  },
  {
    id: '2',
    riverName: 'Kelani River',
    stationName: 'Hanwella',
    district: 'Colombo',
    latitude: 6.9011,
    longitude: 80.0847,
    currentLevel: 4.2,
    warningLevel: 4.5,
    dangerLevel: 5.5,
    status: 'RISING',
    recordedAt: new Date()
  },
  {
    id: '3',
    riverName: 'Kalu Ganga',
    stationName: 'Putupaula',
    district: 'Kalutara',
    latitude: 6.5854,
    longitude: 80.0847,
    currentLevel: 3.8,
    warningLevel: 4.0,
    dangerLevel: 5.0,
    status: 'WARNING',
    recordedAt: new Date()
  },
  {
    id: '4',
    riverName: 'Nilwala Ganga',
    stationName: 'Pitabeddara',
    district: 'Matara',
    latitude: 6.1167,
    longitude: 80.4167,
    currentLevel: 2.5,
    warningLevel: 4.0,
    dangerLevel: 5.0,
    status: 'NORMAL',
    recordedAt: new Date()
  },
  {
    id: '5',
    riverName: 'Gin Ganga',
    stationName: 'Baddegama',
    district: 'Galle',
    latitude: 6.1833,
    longitude: 80.2000,
    currentLevel: 3.2,
    warningLevel: 3.5,
    dangerLevel: 4.5,
    status: 'RISING',
    recordedAt: new Date()
  }
];

const statusConfig: Record<RiverStatus, { label: string; color: string; bgColor: string; icon: React.ReactNode }> = {
  NORMAL: { 
    label: 'Normal', 
    color: 'text-green-400', 
    bgColor: 'bg-green-500/20 border-green-500/30',
    icon: <Minus className="h-4 w-4" />
  },
  RISING: { 
    label: 'Rising', 
    color: 'text-yellow-400', 
    bgColor: 'bg-yellow-500/20 border-yellow-500/30',
    icon: <TrendingUp className="h-4 w-4" />
  },
  WARNING: { 
    label: 'Warning', 
    color: 'text-orange-400', 
    bgColor: 'bg-orange-500/20 border-orange-500/30',
    icon: <AlertTriangle className="h-4 w-4" />
  },
  DANGER: { 
    label: 'Danger', 
    color: 'text-red-400', 
    bgColor: 'bg-red-500/20 border-red-500/30',
    icon: <AlertTriangle className="h-4 w-4" />
  },
  FLOODING: { 
    label: 'Flooding', 
    color: 'text-red-400', 
    bgColor: 'bg-red-500/20 border-red-500/30',
    icon: <Waves className="h-4 w-4" />
  }
};

interface RiverLevelsProps {
  compact?: boolean;
}

export function RiverLevels({ compact = false }: RiverLevelsProps) {
  const [riverLevels, setRiverLevels] = useState<RiverLevel[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchRiverLevels();

    const unsubscribe = realtimeService.subscribe({
      table: 'river_levels',
      callback: () => fetchRiverLevels()
    });

    return () => unsubscribe();
  }, []);

  const fetchRiverLevels = async () => {
    try {
      const { data, error } = await supabase
        .from('river_levels')
        .select('*')
        .order('status', { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        const mapped = data.map((r: any) => ({
          id: r.id,
          riverName: r.river_name,
          stationName: r.station_name,
          district: r.district,
          latitude: r.latitude,
          longitude: r.longitude,
          currentLevel: r.current_level,
          warningLevel: r.warning_level,
          dangerLevel: r.danger_level,
          status: r.status as RiverStatus,
          trend: 'STABLE' as const,
          lastUpdated: new Date(r.recorded_at || r.created_at)
        }));
        setRiverLevels(mapped);
      } else {
        setRiverLevels(fallbackRiverLevels);
      }
    } catch (err) {
      console.error('Error fetching river levels:', err);
      setRiverLevels(fallbackRiverLevels);
    } finally {
      setIsLoading(false);
    }
  };

  const displayData = riverLevels.length > 0 ? riverLevels : fallbackRiverLevels;
  const criticalRivers = displayData.filter(r => r.status === 'DANGER' || r.status === 'FLOODING');
  const displayRivers = compact ? displayData.slice(0, 3) : displayData;

  return (
    <Card className="glass-card border-white/10">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Waves className="h-5 w-5 text-cyan-400" />
            River Levels
          </CardTitle>
          {criticalRivers.length > 0 && (
            <Badge variant="destructive" className="animate-pulse">
              {criticalRivers.length} Critical
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {displayRivers.map((river, index) => {
            const status = statusConfig[river.status];
            const levelPercentage = (river.currentLevel / river.dangerLevel) * 100;

            return (
              <motion.div
                key={river.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={cn(
                  "p-3 rounded-xl border",
                  status.bgColor
                )}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-medium">{river.riverName}</h4>
                    <p className="text-xs text-muted-foreground">
                      {river.stationName} • {river.district}
                    </p>
                  </div>
                  <Badge className={cn("border", status.bgColor, status.color)}>
                    {status.icon}
                    <span className="ml-1">{status.label}</span>
                  </Badge>
                </div>

                {/* Level Bar */}
                <div className="relative h-6 bg-white/10 rounded-full overflow-hidden">
                  {/* Warning level marker */}
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-yellow-500 z-10"
                    style={{ left: `${(river.warningLevel / river.dangerLevel) * 100}%` }}
                  />
                  {/* Danger level marker */}
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10"
                    style={{ left: '100%' }}
                  />
                  {/* Current level */}
                  <motion.div
                    className={cn(
                      "h-full rounded-full",
                      river.status === 'NORMAL' && "bg-green-500",
                      river.status === 'RISING' && "bg-yellow-500",
                      river.status === 'WARNING' && "bg-orange-500",
                      (river.status === 'DANGER' || river.status === 'FLOODING') && "bg-red-500"
                    )}
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(levelPercentage, 100)}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                  />
                  {/* Level text */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-bold text-white drop-shadow">
                      {river.currentLevel.toFixed(1)}m
                    </span>
                  </div>
                </div>

                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>0m</span>
                  <span className="text-yellow-400">Warning: {river.warningLevel}m</span>
                  <span className="text-red-400">Danger: {river.dangerLevel}m</span>
                </div>
              </motion.div>
            );
          })}
        </div>

        {compact && displayData.length > 3 && (
          <button className="w-full mt-3 text-sm text-cyan-400 hover:text-cyan-300">
            View all {displayData.length} monitoring stations →
          </button>
        )}
      </CardContent>
    </Card>
  );
}
