import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SeverityBadge } from "@/components/ui/severity-badge";
import {
  Droplets,
  Wind,
  Thermometer,
  Eye,
  CloudRain,
  Gauge,
  RefreshCw
} from "lucide-react";
import { WeatherConditions, FloodRiskAssessment } from "@/lib/types";
import { WEATHER_CODES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface WeatherCardProps {
  weather: WeatherConditions;
  floodRisk: FloodRiskAssessment;
  location?: string;
  onRefresh?: () => void;
  isLoading?: boolean;
}

export function WeatherCard({ weather, floodRisk, location, onRefresh, isLoading }: WeatherCardProps) {
  const weatherIcon = WEATHER_CODES[weather.weatherCode]?.icon || '🌤️';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="overflow-hidden glass-card border-white/10">
        <CardHeader className="bg-gradient-to-r from-cyan-600/80 to-blue-600/80 text-white pb-8 relative">
          <div className="absolute inset-0 bg-black/20" />
          <div className="relative z-10">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-lg font-medium flex items-center gap-2">
                  Current Weather
                  {onRefresh && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-white/70 hover:text-white hover:bg-white/20"
                      onClick={onRefresh}
                      disabled={isLoading}
                    >
                      <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                    </Button>
                  )}
                </CardTitle>
                {location && (
                  <p className="text-sm text-blue-100 mt-1 truncate max-w-[200px]">{location}</p>
                )}
              </div>
              <SeverityBadge severity={floodRisk.level} />
            </div>

            <div className="flex items-center gap-4 mt-4">
              <div className="text-6xl">{weatherIcon}</div>
              <div>
                <div className="text-5xl font-light">
                  {Math.round(weather.temperature)}°
                </div>
                <div className="text-sm text-blue-100">
                  <p>Feels like {Math.round(weather.feelsLike)}°</p>
                  <p className="capitalize">{weather.weatherDescription}</p>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-4">
          <div className="grid grid-cols-3 gap-4">
            <WeatherMetric
              icon={<Droplets className="h-4 w-4" />}
              label="Humidity"
              value={`${weather.humidity}%`}
            />
            <WeatherMetric
              icon={<Wind className="h-4 w-4" />}
              label="Wind"
              value={`${weather.windSpeed} km/h`}
            />
            <WeatherMetric
              icon={<CloudRain className="h-4 w-4" />}
              label="Rainfall"
              value={`${weather.rainfall} mm`}
            />
            <WeatherMetric
              icon={<Gauge className="h-4 w-4" />}
              label="Pressure"
              value={`${Math.round(weather.pressure)} hPa`}
            />
            <WeatherMetric
              icon={<Eye className="h-4 w-4" />}
              label="Visibility"
              value={`${weather.visibility.toFixed(1)} km`}
            />
            <WeatherMetric
              icon={<Thermometer className="h-4 w-4" />}
              label="Cloud Cover"
              value={`${weather.cloudCover}%`}
            />
          </div>

          {floodRisk.level !== 'LOW' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className={`mt-4 p-3 rounded-lg border ${
                floodRisk.level === 'CRITICAL' ? 'bg-red-500/10 border-red-500/30' :
                floodRisk.level === 'HIGH' ? 'bg-orange-500/10 border-orange-500/30' :
                'bg-yellow-500/10 border-yellow-500/30'
              }`}
            >
              <p className={`text-sm font-medium ${
                floodRisk.level === 'CRITICAL' ? 'text-red-400' :
                floodRisk.level === 'HIGH' ? 'text-orange-400' :
                'text-yellow-400'
              }`}>
                ⚠️ Flood Risk: {floodRisk.level}
              </p>
              <ul className="text-xs text-muted-foreground mt-1 space-y-0.5">
                {floodRisk.recommendations.slice(0, 2).map((rec, i) => (
                  <li key={i}>• {rec}</li>
                ))}
              </ul>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

function WeatherMetric({
  icon,
  label,
  value
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex flex-col items-center text-center p-2 rounded-lg bg-white/5">
      <div className="text-cyan-400 mb-1">{icon}</div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-medium text-sm">{value}</p>
    </div>
  );
}
